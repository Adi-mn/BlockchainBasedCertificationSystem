const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  // Student Information
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [100, 'Student name cannot exceed 100 characters']
  },
  studentEmail: {
    type: String,
    required: [true, 'Student email is required'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },

  // Certificate Details
  certificateType: {
    type: String,
    required: [true, 'Certificate type is required'],
    enum: ['Degree', 'Diploma', 'Certificate', 'Course Completion', 'Professional Certification'],
    trim: true
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [200, 'Course name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  grade: {
    type: String,
    trim: true,
    maxlength: [50, 'Grade cannot exceed 50 characters']
  },

  // Institution Information
  institutionId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Institution ID is required']
  },
  institutionName: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true
  },
  issuerAddress: {
    type: String,
    required: [true, 'Issuer wallet address is required']
  },

  // Dates
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required']
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value > this.issueDate;
      },
      message: 'Expiry date must be after issue date'
    }
  },

  // Blockchain & IPFS
  blockchainId: {
    type: String,
    unique: true,
    sparse: true
  },
  transactionHash: {
    type: String,
    unique: true,
    sparse: true
  },
  ipfsHash: {
    type: String,
    required: [true, 'IPFS hash is required']
  },

  // Verification Status
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },

  // Metadata
  fileSize: Number,
  mimeType: {
    type: String,
    default: 'application/pdf'
  },

  // Multilingual support
  language: {
    type: String,
    enum: ['english', 'hindi', 'tamil', 'telugu', 'malayalam', 'kannada', 'marathi', 'gujarati', 'bengali', 'punjabi', 'urdu'],
    default: 'english'
  },
  certificateData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'issued', 'verified', 'revoked'],
    default: 'pending'
  },

  // Revocation
  isRevoked: {
    type: Boolean,
    default: false
  },
  revokedAt: Date,
  revokedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  revocationReason: String,

  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  verificationCount: {
    type: Number,
    default: 0
  },
  lastVerified: Date
}, {
  timestamps: true
});

// Indexes for better query performance
certificateSchema.index({ studentEmail: 1 });
certificateSchema.index({ institutionId: 1 });
certificateSchema.index({ blockchainId: 1 });
certificateSchema.index({ transactionHash: 1 });
certificateSchema.index({ ipfsHash: 1 });
certificateSchema.index({ isVerified: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ createdAt: -1 });

// Compound indexes
certificateSchema.index({ studentEmail: 1, institutionId: 1 });
certificateSchema.index({ certificateType: 1, status: 1 });

// Virtual for certificate age
certificateSchema.virtual('age').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Virtual for expiry status
certificateSchema.virtual('isExpired').get(function () {
  return this.expiryDate && this.expiryDate < new Date();
});

// Pre-save middleware
certificateSchema.pre('save', function (next) {
  // Set verification timestamp when verified
  if (this.isModified('isVerified') && this.isVerified && !this.verifiedAt) {
    this.verifiedAt = new Date();
  }

  // Set status based on verification
  if (this.isModified('isVerified')) {
    this.status = this.isVerified ? 'verified' : 'issued';
  }

  next();
});

// Instance methods
certificateSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  return this.save();
};

certificateSchema.methods.incrementVerificationCount = function () {
  this.verificationCount += 1;
  this.lastVerified = new Date();
  return this.save();
};

certificateSchema.methods.revoke = function (revokedBy, reason) {
  this.isRevoked = true;
  this.revokedAt = new Date();
  this.revokedBy = revokedBy;
  this.revocationReason = reason;
  this.status = 'revoked';
  return this.save();
};

// Static methods
certificateSchema.statics.getStatsByInstitution = async function (institutionId) {
  const stats = await this.aggregate([
    { $match: { institutionId: mongoose.Types.ObjectId(institutionId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        revoked: { $sum: { $cond: ['$isRevoked', 1, 0] } }
      }
    }
  ]);

  return stats[0] || { total: 0, verified: 0, pending: 0, revoked: 0 };
};

certificateSchema.statics.getStatsByStudent = async function (studentEmail) {
  const stats = await this.aggregate([
    {
      $match: {
        studentEmail,
        isRevoked: { $ne: true } // Exclude revoked certificates from stats
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
      }
    }
  ]);

  return stats[0] || { total: 0, verified: 0, pending: 0 };
};

certificateSchema.statics.getGlobalStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        revoked: { $sum: { $cond: ['$isRevoked', 1, 0] } },
        totalVerifications: { $sum: '$verificationCount' }
      }
    }
  ]);

  return stats[0] || { total: 0, verified: 0, pending: 0, revoked: 0, totalVerifications: 0 };
};

certificateSchema.statics.searchCertificates = async function (query, limit = 10) {
  const searchRegex = new RegExp(query, 'i');

  return this.find({
    $or: [
      { studentName: searchRegex },
      { studentEmail: searchRegex },
      { certificateType: searchRegex },
      { courseName: searchRegex },
      { institutionName: searchRegex },
      { blockchainId: searchRegex }
    ],
    isRevoked: false
  })
    .populate('institutionId', 'name organization')
    .limit(limit)
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Certificate', certificateSchema);