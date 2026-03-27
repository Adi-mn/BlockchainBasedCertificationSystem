const express = require('express');
const Certificate = require('../models/Certificate');
const VerificationLog = require('../models/VerificationLog');
const { protect, authorize } = require('../middleware/auth');
const { validateSearchQuery } = require('../middleware/validation');

const router = express.Router();

// All routes are protected and require verifier role
router.use(protect);
router.use(authorize('verifier', 'admin'));

// @desc    Get verifier dashboard stats
// @route   GET /api/verifier/stats
// @access  Private (Verifier only)
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Get verification stats for this verifier
    const totalVerifications = await VerificationLog.countDocuments({
      verifierId: userId
    });

    const verificationStats = await VerificationLog.aggregate([
      { $match: { verifierId: userId } },
      {
        $group: {
          _id: '$verificationResult',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalVerifications,
      validCertificates: 0,
      invalidCertificates: 0,
      expiredCertificates: 0,
      revokedCertificates: 0,
      notFoundCertificates: 0
    };

    verificationStats.forEach(stat => {
      switch (stat._id) {
        case 'valid':
          stats.validCertificates = stat.count;
          break;
        case 'invalid':
          stats.invalidCertificates = stat.count;
          break;
        case 'expired':
          stats.expiredCertificates = stat.count;
          break;
        case 'revoked':
          stats.revokedCertificates = stat.count;
          break;
        case 'not_found':
          stats.notFoundCertificates = stat.count;
          break;
      }
    });

    res.status(200).json({
      success: true,
      ...stats
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get recent verifications by this verifier
// @route   GET /api/verifier/recent-verifications
// @access  Private (Verifier only)
router.get('/recent-verifications', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user._id;

    const recentVerifications = await VerificationLog.find({
      verifierId: userId
    })
    .populate({
      path: 'certificateId',
      select: 'studentName certificateType courseName institutionName',
      populate: {
        path: 'institutionId',
        select: 'name organization'
      }
    })
    .sort({ createdAt: -1 })
    .limit(limit);

    const formattedVerifications = recentVerifications.map(verification => ({
      _id: verification._id,
      certificateType: verification.certificateId?.certificateType || 'Unknown',
      studentName: verification.certificateId?.studentName || 'Unknown',
      courseName: verification.certificateId?.courseName || 'Unknown',
      institutionName: verification.certificateId?.institutionName || 'Unknown',
      status: verification.verificationResult,
      verificationMethod: verification.verificationMethod,
      verifiedAt: verification.createdAt,
      responseTime: verification.responseTime
    }));

    res.status(200).json({
      success: true,
      count: formattedVerifications.length,
      verifications: formattedVerifications
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search and verify certificates
// @route   GET /api/verifier/search
// @access  Private (Verifier only)
router.get('/search', validateSearchQuery, async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const startTime = Date.now();
    const certificates = await Certificate.searchCertificates(q, parseInt(limit));
    const responseTime = Date.now() - startTime;

    // Log search activity
    if (certificates.length > 0) {
      // Log verification attempts for found certificates
      const verificationLogs = certificates.map(cert => ({
        certificateId: cert._id,
        verifierId: req.user._id,
        verifierIP: req.ip,
        verifierUserAgent: req.get('User-Agent'),
        verificationMethod: 'manual_search',
        verificationResult: cert.isRevoked ? 'revoked' : 
                           cert.isExpired ? 'expired' : 
                           cert.isVerified ? 'valid' : 'invalid',
        blockchainVerified: cert.blockchainId ? true : false,
        ipfsVerified: cert.ipfsHash ? true : false,
        responseTime: responseTime / certificates.length
      }));

      await VerificationLog.insertMany(verificationLogs);
    }

    // Add verification status to each certificate
    const certificatesWithStatus = certificates.map(cert => ({
      ...cert.toObject(),
      verificationStatus: cert.isRevoked ? 'revoked' : 
                         cert.isExpired ? 'expired' : 
                         cert.isVerified ? 'valid' : 'invalid'
    }));

    res.status(200).json({
      success: true,
      count: certificatesWithStatus.length,
      certificates: certificatesWithStatus,
      searchQuery: q,
      responseTime
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify specific certificate
// @route   POST /api/verifier/verify/:id
// @access  Private (Verifier only)
router.post('/verify/:id', async (req, res, next) => {
  try {
    const certificateId = req.params.id;
    const startTime = Date.now();

    const certificate = await Certificate.findById(certificateId)
      .populate('institutionId', 'name organization');

    if (!certificate) {
      // Log failed verification
      await VerificationLog.create({
        certificateId,
        verifierId: req.user._id,
        verifierIP: req.ip,
        verifierUserAgent: req.get('User-Agent'),
        verificationMethod: 'manual_search',
        verificationResult: 'not_found',
        blockchainVerified: false,
        ipfsVerified: false,
        responseTime: Date.now() - startTime
      });

      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Determine verification result
    let verificationResult = 'invalid';
    let isValid = false;

    if (certificate.isRevoked) {
      verificationResult = 'revoked';
    } else if (certificate.isExpired) {
      verificationResult = 'expired';
    } else if (certificate.isVerified) {
      verificationResult = 'valid';
      isValid = true;
    }

    const responseTime = Date.now() - startTime;

    // Log verification
    await VerificationLog.create({
      certificateId,
      verifierId: req.user._id,
      verifierIP: req.ip,
      verifierUserAgent: req.get('User-Agent'),
      verificationMethod: 'manual_search',
      verificationResult,
      blockchainVerified: certificate.blockchainId ? true : false,
      ipfsVerified: certificate.ipfsHash ? true : false,
      responseTime
    });

    // Increment certificate verification count
    await certificate.incrementVerificationCount();

    res.status(200).json({
      success: true,
      isValid,
      verificationResult,
      certificate: {
        _id: certificate._id,
        studentName: certificate.studentName,
        studentEmail: certificate.studentEmail,
        certificateType: certificate.certificateType,
        courseName: certificate.courseName,
        institutionName: certificate.institutionName,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        grade: certificate.grade,
        description: certificate.description,
        isVerified: certificate.isVerified,
        isRevoked: certificate.isRevoked,
        blockchainId: certificate.blockchainId,
        ipfsHash: certificate.ipfsHash,
        createdAt: certificate.createdAt
      },
      verificationDetails: {
        verifiedBy: req.user.name,
        verifiedAt: new Date(),
        verificationMethod: 'manual_search',
        responseTime
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get verification history
// @route   GET /api/verifier/history
// @access  Private (Verifier only)
router.get('/history', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { verifierId: req.user._id };
    
    // Add date filter if provided
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Add result filter if provided
    if (req.query.result) {
      filter.verificationResult = req.query.result;
    }

    const verifications = await VerificationLog.find(filter)
      .populate({
        path: 'certificateId',
        select: 'studentName certificateType courseName institutionName',
        populate: {
          path: 'institutionId',
          select: 'name organization'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await VerificationLog.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: verifications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      verifications
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get verification analytics for verifier
// @route   GET /api/verifier/analytics
// @access  Private (Verifier only)
router.get('/analytics', async (req, res, next) => {
  try {
    const timeframe = parseInt(req.query.timeframe) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    const userId = req.user._id;

    // Verification trends
    const trends = await VerificationLog.aggregate([
      { 
        $match: { 
          verifierId: userId,
          createdAt: { $gte: startDate }
        }
      },
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
          },
          avgResponseTime: { $avg: '$responseTime' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Verification methods breakdown
    const methods = await VerificationLog.aggregate([
      { 
        $match: { 
          verifierId: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$verificationMethod',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Most verified certificate types
    const certificateTypes = await VerificationLog.aggregate([
      { 
        $match: { 
          verifierId: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'certificates',
          localField: 'certificateId',
          foreignField: '_id',
          as: 'certificate'
        }
      },
      { $unwind: '$certificate' },
      {
        $group: {
          _id: '$certificate.certificateType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      timeframe,
      trends,
      methods,
      certificateTypes
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;