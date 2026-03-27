const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema({
  certificateId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Certificate',
    required: [true, 'Certificate ID is required']
  },
  verifierId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  verifierIP: {
    type: String,
    required: true
  },
  verifierUserAgent: String,
  verificationMethod: {
    type: String,
    enum: ['qr_scan', 'manual_search', 'direct_link', 'api_call'],
    required: true
  },
  verificationResult: {
    type: String,
    enum: ['valid', 'invalid', 'expired', 'revoked', 'not_found'],
    required: true
  },
  blockchainVerified: {
    type: Boolean,
    default: false
  },
  ipfsVerified: {
    type: Boolean,
    default: false
  },
  responseTime: {
    type: Number, // in milliseconds
    required: true
  },
  location: {
    country: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  additionalData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for analytics and performance
verificationLogSchema.index({ certificateId: 1 });
verificationLogSchema.index({ verifierId: 1 });
verificationLogSchema.index({ verifierIP: 1 });
verificationLogSchema.index({ createdAt: -1 });
verificationLogSchema.index({ verificationResult: 1 });
verificationLogSchema.index({ verificationMethod: 1 });

// Compound indexes
verificationLogSchema.index({ certificateId: 1, createdAt: -1 });
verificationLogSchema.index({ verificationResult: 1, createdAt: -1 });

// Static methods for analytics
verificationLogSchema.statics.getVerificationStats = async function(timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);
  
  const stats = await this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$verificationResult',
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$responseTime' }
      }
    }
  ]);
  
  const result = {
    total: 0,
    valid: 0,
    invalid: 0,
    expired: 0,
    revoked: 0,
    not_found: 0,
    avgResponseTime: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
    if (stat._id === 'valid') {
      result.avgResponseTime = stat.avgResponseTime;
    }
  });
  
  return result;
};

verificationLogSchema.statics.getVerificationsByMethod = async function(timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$verificationMethod',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

verificationLogSchema.statics.getTopVerifiedCertificates = async function(limit = 10, timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$certificateId',
        verificationCount: { $sum: 1 },
        lastVerified: { $max: '$createdAt' }
      }
    },
    { $sort: { verificationCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'certificates',
        localField: '_id',
        foreignField: '_id',
        as: 'certificate'
      }
    },
    { $unwind: '$certificate' }
  ]);
};

verificationLogSchema.statics.getVerificationTrends = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        validCount: {
          $sum: { $cond: [{ $eq: ['$verificationResult', 'valid'] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

module.exports = mongoose.model('VerificationLog', verificationLogSchema);