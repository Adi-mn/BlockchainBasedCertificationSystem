const express = require('express');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const VerificationLog = require('../models/VerificationLog');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId, validateUserStatusUpdate } = require('../middleware/validation');

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
router.get('/stats', async (req, res, next) => {
  try {
    // Get user stats
    const userStats = await User.getStats();
    
    // Get certificate stats
    const certificateStats = await Certificate.getGlobalStats();
    
    // Get verification stats (last 30 days)
    const verificationStats = await VerificationLog.getVerificationStats(30);
    
    // Get recent activity
    const recentCertificates = await Certificate.find()
      .populate('institutionId', 'name organization')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentVerifications = await VerificationLog.find()
      .populate('certificateId', 'studentName certificateType')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      totalUsers: userStats.total,
      totalInstitutions: userStats.institution,
      totalCertificates: certificateStats.total,
      totalVerifications: verificationStats.total,
      verifiedCertificates: certificateStats.verified,
      pendingCertificates: certificateStats.pending,
      revokedCertificates: certificateStats.revoked,
      recentCertificates,
      recentVerifications,
      userBreakdown: {
        admin: userStats.admin,
        institution: userStats.institution,
        student: userStats.student,
        verifier: userStats.verifier
      },
      verificationBreakdown: {
        valid: verificationStats.valid,
        invalid: verificationStats.invalid,
        expired: verificationStats.expired,
        revoked: verificationStats.revoked,
        not_found: verificationStats.not_found
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get recent activity
// @route   GET /api/admin/recent-activity
// @access  Private (Admin only)
router.get('/recent-activity', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent certificates
    const recentCertificates = await Certificate.find()
      .populate('institutionId', 'name organization')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Get recent verifications
    const recentVerifications = await VerificationLog.find()
      .populate('certificateId', 'studentName certificateType')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Get recent user registrations
    const recentUsers = await User.find()
      .select('name email role organization createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Combine and format activities
    const activities = [];

    recentCertificates.forEach(cert => {
      activities.push({
        type: 'certificate_issued',
        action: `Certificate issued to ${cert.studentName}`,
        details: `${cert.certificateType} - ${cert.courseName}`,
        institution: cert.institutionId?.name,
        timestamp: cert.createdAt
      });
    });

    recentVerifications.forEach(verification => {
      activities.push({
        type: 'certificate_verified',
        action: `Certificate verification attempt`,
        details: `${verification.certificateId?.studentName} - ${verification.verificationResult}`,
        method: verification.verificationMethod,
        timestamp: verification.createdAt
      });
    });

    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registered',
        action: `New ${user.role} registered`,
        details: `${user.name} (${user.email})`,
        organization: user.organization,
        timestamp: user.createdAt
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, limit);

    res.status(200).json({
      success: true,
      count: limitedActivities.length,
      activities: limitedActivities
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (Admin only)
router.get('/users/:id', validateObjectId, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's certificates if they're a student
    let certificates = [];
    if (user.role === 'student') {
      certificates = await Certificate.find({ studentEmail: user.email })
        .populate('institutionId', 'name organization')
        .sort({ createdAt: -1 });
    }

    // Get user's issued certificates if they're an institution
    let issuedCertificates = [];
    if (user.role === 'institution') {
      issuedCertificates = await Certificate.find({ institutionId: user._id })
        .sort({ createdAt: -1 })
        .limit(10);
    }

    res.status(200).json({
      success: true,
      user,
      certificates,
      issuedCertificates
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user status
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin only)
router.patch('/users/:id/status', validateObjectId, validateUserStatusUpdate, async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
router.delete('/users/:id', validateObjectId, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting other admins
    if (user.role === 'admin' && user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete other admin users'
      });
    }

    // Check if user has associated certificates
    if (user.role === 'institution') {
      const certificateCount = await Certificate.countDocuments({ institutionId: user._id });
      if (certificateCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete user. They have ${certificateCount} associated certificates.`
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get verification analytics
// @route   GET /api/admin/analytics/verifications
// @access  Private (Admin only)
router.get('/analytics/verifications', async (req, res, next) => {
  try {
    const timeframe = parseInt(req.query.timeframe) || 30;

    // Get verification stats
    const stats = await VerificationLog.getVerificationStats(timeframe);
    
    // Get verification methods breakdown
    const methods = await VerificationLog.getVerificationsByMethod(timeframe);
    
    // Get verification trends
    const trends = await VerificationLog.getVerificationTrends(timeframe);
    
    // Get top verified certificates
    const topCertificates = await VerificationLog.getTopVerifiedCertificates(10, timeframe);

    res.status(200).json({
      success: true,
      timeframe,
      stats,
      methods,
      trends,
      topCertificates
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get certificate analytics
// @route   GET /api/admin/analytics/certificates
// @access  Private (Admin only)
router.get('/analytics/certificates', async (req, res, next) => {
  try {
    const timeframe = parseInt(req.query.timeframe) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    // Certificates by type
    const certificatesByType = await Certificate.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$certificateType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Certificates by institution
    const certificatesByInstitution = await Certificate.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$institutionName',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Certificate trends
    const certificateTrends = await Certificate.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.status(200).json({
      success: true,
      timeframe,
      certificatesByType,
      certificatesByInstitution,
      certificateTrends
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get system health
// @route   GET /api/admin/system/health
// @access  Private (Admin only)
router.get('/system/health', async (req, res, next) => {
  try {
    // Database health
    const dbStats = await Promise.all([
      User.countDocuments(),
      Certificate.countDocuments(),
      VerificationLog.countDocuments()
    ]);

    // Recent activity check
    const recentActivity = await Certificate.findOne().sort({ createdAt: -1 });
    const lastActivity = recentActivity ? recentActivity.createdAt : null;

    // System metrics
    const systemHealth = {
      database: {
        status: 'healthy',
        users: dbStats[0],
        certificates: dbStats[1],
        verificationLogs: dbStats[2]
      },
      lastActivity,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      health: systemHealth
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;