const express = require('express');
const Certificate = require('../models/Certificate');
const VerificationLog = require('../models/VerificationLog');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  validateCertificateCreation,
  validateObjectId,
  validateCertificateId,
  validateSearchQuery
} = require('../middleware/validation');
const emailService = require('../utils/emailService');
const PremiumCertificateGenerator = require('../utils/premiumCertificateGenerator');

const router = express.Router();

// @desc    Create new certificate
// @route   POST /api/certificates
// @access  Private (Institution only)
router.post('/', protect, authorize('institution'), validateCertificateCreation, async (req, res, next) => {
  try {
    const certificateData = {
      ...req.body,
      institutionId: req.user._id,
      institutionName: req.user.organization || req.user.name
    };

    // Auto-create student account if it doesn't exist
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');

    let student = await User.findOne({ email: req.body.studentEmail });

    if (!student) {
      console.log(`🎓 Auto-creating student account for: ${req.body.studentEmail}`);

      // Don't hash password here - let the pre-save hook handle it
      student = await User.create({
        name: req.body.studentName,
        email: req.body.studentEmail,
        password: 'password123', // Default simple password as requested
        role: 'student',
        isVerified: true
      });

      console.log(`✅ Student account created: ${student.email}`);
    }

    const certificate = await Certificate.create(certificateData);

    // Generate PDF certificate
    let pdfBuffer = null;
    try {
      console.log('📄 Generating PDF certificate...');
      const pdfGenerator = new PremiumCertificateGenerator();

      const verificationUrl = `${req.protocol}://${req.get('host')}/certificate/${certificate._id}`;

      const pdfData = {
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        institutionName: certificate.institutionName,
        certificateType: certificate.certificateType,
        issueDate: certificate.issueDate,
        _id: certificate._id,
        grade: certificate.grade,
        description: certificate.description,
        verificationUrl: verificationUrl
      };

      pdfBuffer = await pdfGenerator.generatePremiumCertificate(pdfData);
      console.log('✅ PDF certificate generated successfully');
    } catch (pdfError) {
      console.error('⚠️ PDF generation failed:', pdfError);
      // Continue without PDF - email will still be sent
    }

    // Send automatic email notification
    try {
      console.log('📧 Sending automatic email notification...');
      const verificationUrl = `${req.protocol}://${req.get('host')}/certificate/${certificate._id}`;

      const emailData = {
        studentEmail: certificate.studentEmail,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        certificateType: certificate.certificateType,
        institutionName: certificate.institutionName,
        issueDate: certificate.issueDate,
        certificateId: certificate._id,
        verificationUrl: verificationUrl,
        language: certificate.language || 'english'
      };

      // Send email with PDF attachment
      const emailResult = await emailService.sendCertificateNotification(emailData, pdfBuffer);

      if (emailResult.success) {
        console.log('✅ Email notification sent successfully');
      }
    } catch (emailError) {
      console.error('❌ Email notification error:', emailError);
      // Don't fail certificate generation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Certificate created and emailed with PDF attachment successfully',
      certificate,
      emailSent: true,
      pdfAttached: pdfBuffer ? true : false,
      studentAccountCreated: !student.createdAt || student.createdAt.getTime() === student.updatedAt.getTime()
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all certificates (with filters)
// @route   GET /api/certificates
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.certificateType) filter.certificateType = req.query.certificateType;
    if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';
    if (req.query.isRevoked !== undefined) filter.isRevoked = req.query.isRevoked === 'true';

    const certificates = await Certificate.find(filter)
      .populate('institutionId', 'name organization')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Certificate.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: certificates.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      certificates
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get certificates by institution
// @route   GET /api/certificates/institution
// @access  Private (Institution only)
router.get('/institution', protect, authorize('institution'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const certificates = await Certificate.find({ institutionId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Certificate.countDocuments({ institutionId: req.user._id });

    res.status(200).json({
      success: true,
      count: certificates.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      certificates
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get certificates by student
// @route   GET /api/certificates/student
// @access  Private (Student only)
router.get('/student', protect, authorize('student'), async (req, res, next) => {
  try {
    // Only show non-revoked certificates to students
    const certificates = await Certificate.find({
      studentEmail: req.user.email,
      isRevoked: { $ne: true } // Exclude revoked certificates
    })
      .populate('institutionId', 'name organization')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get institution stats
// @route   GET /api/certificates/institution/stats
// @access  Private (Institution only)
router.get('/institution/stats', protect, authorize('institution'), async (req, res, next) => {
  try {
    const stats = await Certificate.getStatsByInstitution(req.user._id);

    // Get recent uploads (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUploads = await Certificate.countDocuments({
      institutionId: req.user._id,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get unique students count
    const uniqueStudents = await Certificate.distinct('studentEmail', {
      institutionId: req.user._id
    });

    res.status(200).json({
      success: true,
      totalCertificates: stats.total,
      totalStudents: uniqueStudents.length,
      recentUploads,
      verifiedCertificates: stats.verified,
      pendingCertificates: stats.pending
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get student stats
// @route   GET /api/certificates/student/stats
// @access  Private (Student only)
router.get('/student/stats', protect, authorize('student'), async (req, res, next) => {
  try {
    const stats = await Certificate.getStatsByStudent(req.user.email);

    res.status(200).json({
      success: true,
      totalCertificates: stats.total,
      verifiedCertificates: stats.verified,
      pendingCertificates: stats.pending
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search certificates
// @route   GET /api/certificates/search
// @access  Public (with optional auth)
router.get('/search', optionalAuth, validateSearchQuery, async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const certificates = await Certificate.searchCertificates(q, parseInt(limit));

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single certificate
// @route   GET /api/certificates/:id
// @access  Public (with optional auth)
router.get('/:id', optionalAuth, validateCertificateId, async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('institutionId', 'name organization')
      .populate('verifiedBy', 'name');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Increment view count
    await certificate.incrementViewCount();

    res.status(200).json({
      success: true,
      certificate
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get public certificate (for sharing)
// @route   GET /api/certificates/public/:id
// @access  Public (no authentication required)
router.get('/public/:id', validateCertificateId, async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('institutionId', 'name organization');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Only return public information (no sensitive data)
    const publicCertificate = {
      _id: certificate._id,
      certificateId: certificate.certificateId,
      certificateType: certificate.certificateType,
      courseName: certificate.courseName,
      studentName: certificate.studentName,
      institutionName: certificate.institutionId?.name || certificate.institutionName,
      issueDate: certificate.issueDate,
      expiryDate: certificate.expiryDate,
      grade: certificate.grade,
      description: certificate.description,
      language: certificate.language,
      isVerified: certificate.isVerified,
      isRevoked: certificate.isRevoked,
      blockchainId: certificate.blockchainId,
      ipfsHash: certificate.ipfsHash,
      createdAt: certificate.createdAt,
      viewCount: certificate.viewCount,
      verificationCount: certificate.verificationCount
    };

    // Increment view count for public access
    await certificate.incrementViewCount();

    res.status(200).json({
      success: true,
      certificate: publicCertificate
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify certificate
// @route   GET /api/certificates/:id/verify
// @access  Public
router.get('/:id/verify', validateCertificateId, async (req, res, next) => {
  try {
    const startTime = Date.now();

    const certificate = await Certificate.findById(req.params.id)
      .populate('institutionId', 'name organization');

    const responseTime = Date.now() - startTime;
    let verificationResult = 'not_found';
    let exists = false;

    if (certificate) {
      exists = true;

      if (certificate.isRevoked) {
        verificationResult = 'revoked';
      } else if (certificate.isExpired) {
        verificationResult = 'expired';
      } else if (certificate.isVerified) {
        verificationResult = 'valid';
      } else {
        verificationResult = 'invalid';
      }

      // Increment verification count
      await certificate.incrementVerificationCount();
    }

    // Log verification attempt
    await VerificationLog.create({
      certificateId: req.params.id,
      verifierIP: req.ip,
      verifierUserAgent: req.get('User-Agent'),
      verificationMethod: 'direct_link',
      verificationResult,
      blockchainVerified: certificate?.blockchainId ? true : false,
      ipfsVerified: certificate?.ipfsHash ? true : false,
      responseTime
    });

    res.status(200).json({
      success: true,
      exists,
      verificationResult,
      certificate: exists ? certificate : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Log verification attempt
// @route   POST /api/certificates/:id/log-verification
// @access  Public
router.post('/:id/log-verification', validateCertificateId, async (req, res, next) => {
  try {
    const { verificationMethod = 'direct_link', additionalData } = req.body;

    const certificate = await Certificate.findById(req.params.id);
    let verificationResult = 'not_found';

    if (certificate) {
      if (certificate.isRevoked) {
        verificationResult = 'revoked';
      } else if (certificate.isExpired) {
        verificationResult = 'expired';
      } else if (certificate.isVerified) {
        verificationResult = 'valid';
      } else {
        verificationResult = 'invalid';
      }
    }

    await VerificationLog.create({
      certificateId: req.params.id,
      verifierIP: req.ip,
      verifierUserAgent: req.get('User-Agent'),
      verificationMethod,
      verificationResult,
      blockchainVerified: certificate?.blockchainId ? true : false,
      ipfsVerified: certificate?.ipfsHash ? true : false,
      responseTime: 100, // Default response time
      additionalData
    });

    res.status(200).json({
      success: true,
      message: 'Verification logged successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Download certificate file
// @route   GET /api/certificates/:id/download
// @access  Private
router.get('/:id/download', protect, validateCertificateId, async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check permissions
    const isOwner = req.user.email === certificate.studentEmail;
    const isIssuer = req.user._id.toString() === certificate.institutionId.toString();
    const isAdmin = req.user.role === 'admin';
    const isVerifier = req.user.role === 'verifier';

    if (!isOwner && !isIssuer && !isAdmin && !isVerifier) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this certificate'
      });
    }

    // Generate PDF certificate on-the-fly
    try {
      let pdfBuffer;

      console.log(`📄 Generating PDF for certificate: ${certificate._id}`);
      console.log(`Language: ${certificate.language || 'english'}`);
      console.log(`Auto-generated: ${certificate.certificateData?.autoGenerated || false}`);

      // Check if it's an auto-generated certificate
      if (certificate.certificateData?.autoGenerated) {
        const AutoCertificateGenerator = require('../utils/autoCertificateGenerator');
        const autoGenerator = new AutoCertificateGenerator();

        const inputData = {
          studentName: certificate.studentName,
          courseName: certificate.courseName,
          teacherName: certificate.certificateData.teacherName || 'Teacher',
          instituteName: certificate.institutionName,
          certificateId: certificate._id.toString(),
          issuedDate: certificate.issueDate,
          grade: certificate.grade,
          description: certificate.description,
          language: certificate.language || 'english',
          template: certificate.certificateData.template || 'classic'
        };

        pdfBuffer = await autoGenerator.generatePDF(inputData);
      }
      // Check if it's a multilingual certificate
      else if (certificate.language && certificate.language !== 'english') {
        try {
          const MultilingualCertificateGenerator = require('../utils/multilingualCertificate');
          const multiGenerator = new MultilingualCertificateGenerator();

          const certificateData = {
            studentName: certificate.studentName,
            courseName: certificate.courseName,
            instituteName: certificate.institutionName,
            certificateId: certificate._id.toString(),
            grade: certificate.grade,
            description: certificate.description,
            issuedDate: certificate.issueDate,
            language: certificate.language
          };

          // Use the generatePDF method directly to avoid IPFS issues
          pdfBuffer = await multiGenerator.generatePDF(certificateData);
        } catch (multiError) {
          console.error('Multilingual PDF generation failed:', multiError);

          // Fallback: Generate a basic multilingual certificate using PDFKit
          const PDFDocument = require('pdfkit');

          pdfBuffer = await new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => {
              resolve(Buffer.concat(chunks));
            });
            doc.on('error', reject);

            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;

            // Background
            doc.rect(0, 0, pageWidth, pageHeight).fill('#f8f9fa');

            // Border
            doc.rect(50, 50, pageWidth - 100, pageHeight - 100)
              .stroke('#2563eb', 3);

            // Title (in original language)
            doc.fillColor('#1f2937')
              .fontSize(36)
              .font('Helvetica-Bold')
              .text('प्रमाणपत्र', 0, 120, {
                align: 'center',
                width: pageWidth
              });

            // Subtitle
            doc.fontSize(18)
              .font('Helvetica')
              .text('यह प्रमाणित करता है कि', 0, 200, {
                align: 'center',
                width: pageWidth
              });

            // Student name
            doc.fontSize(32)
              .font('Helvetica-Bold')
              .fillColor('#2563eb')
              .text(certificate.studentName, 0, 250, {
                align: 'center',
                width: pageWidth
              });

            // Course completion text
            doc.fontSize(18)
              .font('Helvetica')
              .fillColor('#1f2937')
              .text('ने सफलतापूर्वक पूरा किया है', 0, 320, {
                align: 'center',
                width: pageWidth
              });

            // Course name
            doc.fontSize(24)
              .font('Helvetica-Bold')
              .fillColor('#059669')
              .text(certificate.courseName, 0, 370, {
                align: 'center',
                width: pageWidth
              });

            // Institution
            doc.fontSize(16)
              .font('Helvetica')
              .fillColor('#1f2937')
              .text(`संस्थान: ${certificate.institutionName}`, 0, 450, {
                align: 'center',
                width: pageWidth
              });

            // Date
            doc.fontSize(14)
              .text(`जारी करने की तारीख: ${new Date(certificate.issueDate).toLocaleDateString('hi-IN')}`, 0, 480, {
                align: 'center',
                width: pageWidth
              });

            // Grade if available
            if (certificate.grade) {
              doc.fontSize(16)
                .font('Helvetica-Bold')
                .fillColor('#dc2626')
                .text(`ग्रेड: ${certificate.grade}`, 0, 520, {
                  align: 'center',
                  width: pageWidth
                });
            }

            // Language indicator
            doc.fontSize(10)
              .font('Helvetica')
              .fillColor('#6b7280')
              .text(`भाषा: ${certificate.language}`, 60, pageHeight - 100);

            // Certificate ID
            doc.text(`प्रमाणपत्र ID: ${certificate._id}`, 60, pageHeight - 80);

            doc.end();
          });
        }
      }
      // Regular certificate - generate a basic PDF
      else {
        const PDFDocument = require('pdfkit');

        pdfBuffer = await new Promise((resolve, reject) => {
          const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
          const chunks = [];

          doc.on('data', chunk => chunks.push(chunk));
          doc.on('end', () => {
            resolve(Buffer.concat(chunks));
          });
          doc.on('error', reject);

          // Generate basic certificate PDF with better styling
          const pageWidth = doc.page.width;
          const pageHeight = doc.page.height;

          // Background
          doc.rect(0, 0, pageWidth, pageHeight).fill('#f8f9fa');

          // Border
          doc.rect(50, 50, pageWidth - 100, pageHeight - 100)
            .stroke('#2563eb', 3);

          // Title - Reduced size and better positioning
          doc.fillColor('#1f2937')
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('CERTIFICATE OF COMPLETION', 0, 80, {
              align: 'center',
              width: pageWidth
            });

          // Subtitle - Smaller and closer
          doc.fontSize(14)
            .font('Helvetica')
            .text('This is to certify that', 0, 130, {
              align: 'center',
              width: pageWidth
            });

          // Student name - Reduced size
          doc.fontSize(20)
            .font('Helvetica-Bold')
            .fillColor('#2563eb')
            .text(certificate.studentName, 0, 165, {
              align: 'center',
              width: pageWidth
            });

          // Course completion text - Smaller
          doc.fontSize(14)
            .font('Helvetica')
            .fillColor('#1f2937')
            .text('has successfully completed the course', 0, 200, {
              align: 'center',
              width: pageWidth
            });

          // Course name - Reduced size
          doc.fontSize(18)
            .font('Helvetica-Bold')
            .fillColor('#059669')
            .text(certificate.courseName, 0, 235, {
              align: 'center',
              width: pageWidth
            });

          // Institution - Smaller
          doc.fontSize(12)
            .font('Helvetica')
            .fillColor('#1f2937')
            .text(`Issued by: ${certificate.institutionName}`, 0, 280, {
              align: 'center',
              width: pageWidth
            });

          // Date - Smaller
          doc.fontSize(10)
            .text(`Date of Issue: ${new Date(certificate.issueDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}`, 0, 305, {
              align: 'center',
              width: pageWidth
            });

          // Grade if available - Smaller and positioned better
          if (certificate.grade) {
            doc.fontSize(12)
              .font('Helvetica-Bold')
              .fillColor('#dc2626')
              .text(`Grade: ${certificate.grade}`, 0, 330, {
                align: 'center',
                width: pageWidth
              });
          }

          // Certificate ID - Bottom left, smaller
          doc.fontSize(7)
            .font('Helvetica')
            .fillColor('#6b7280')
            .text(`Certificate ID: ${certificate._id}`, 60, pageHeight - 50);

          // Verification text - Bottom left, smaller
          doc.fontSize(7)
            .text('This certificate can be verified online', 60, pageHeight - 35);

          doc.end();
        });
      }

      // Set headers for PDF download
      const safeStudentName = certificate.studentName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
      const safeCourseName = certificate.courseName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
      const filename = `certificate-${safeStudentName}-${safeCourseName}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send the PDF
      res.send(pdfBuffer);

    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);

      // Fallback: If PDF generation fails, return IPFS URL
      if (certificate.ipfsHash && certificate.ipfsHash !== 'pending') {
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${certificate.ipfsHash}`;
        return res.redirect(ipfsUrl);
      } else {
        return res.status(500).json({
          success: false,
          message: 'Certificate file not available for download'
        });
      }
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Download certificate file (Public access for QR codes) - PREMIUM VERSION
// @route   GET /api/certificates/:id/public-download
// @access  Public
router.get('/:id/public-download', validateCertificateId, async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Only allow download of verified certificates for public access
    if (!certificate.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Certificate must be verified before public download'
      });
    }

    // Generate premium PDF certificate
    try {
      let pdfBuffer;
      let filename;

      // Check if it's an auto-generated certificate (New System)
      if (certificate.certificateData?.autoGenerated) {
        console.log('🎨 Generating auto-generated certificate PDF...');
        const AutoCertificateGenerator = require('../utils/autoCertificateGenerator');
        const autoGenerator = new AutoCertificateGenerator();

        const inputData = {
          studentName: certificate.studentName,
          courseName: certificate.courseName,
          teacherName: certificate.certificateData.teacherName || 'Teacher',
          instituteName: certificate.institutionName,
          certificateId: certificate._id.toString(),
          issuedDate: certificate.issueDate,
          grade: certificate.grade,
          description: certificate.description,
          language: certificate.language || 'english',
          template: certificate.certificateData.template || 'classic'
        };

        pdfBuffer = await autoGenerator.generatePDF(inputData);
        filename = `certificate-${certificate.studentName.replace(/\s+/g, '-')}-${certificate.courseName.replace(/\s+/g, '-')}.pdf`;
      }
      // Legacy Premium/Standard System
      else {
        const PremiumCertificateGenerator = require('../utils/premiumCertificateGenerator');
        const premiumGenerator = new PremiumCertificateGenerator();

        console.log('🎨 Generating premium certificate PDF...');

        pdfBuffer = await premiumGenerator.generatePremiumCertificate(certificate);
        filename = `${certificate.studentName.replace(/\s+/g, '_')}_${certificate.courseName.replace(/\s+/g, '_')}_Premium_Certificate.pdf`;
      }

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send the PDF buffer
      res.send(pdfBuffer);

      console.log(`✅ PDF download successful: ${filename} (${pdfBuffer.length} bytes)`);

    } catch (pdfError) {
      console.error('❌ PDF generation error:', pdfError);
      return res.status(500).json({
        success: false,
        message: 'Certificate file not available for download'
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Update certificate
// @route   PUT /api/certificates/:id
// @access  Private (Institution owner or Admin)
router.put('/:id', protect, validateCertificateId, async (req, res, next) => {
  try {
    let certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check permissions
    const isOwner = req.user._id.toString() === certificate.institutionId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this certificate'
      });
    }

    // Only allow certain fields to be updated
    const allowedUpdates = ['description', 'grade', 'expiryDate'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Certificate updated successfully',
      certificate
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify certificate (mark as verified)
// @route   POST /api/certificates/:id/verify
// @access  Private (Admin, Verifier, or Institution owner)
router.post('/:id/verify', protect, validateCertificateId, async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check permissions - Admin, Verifier, or Institution that issued the certificate
    const isAdmin = req.user.role === 'admin';
    const isVerifier = req.user.role === 'verifier';
    const isIssuer = req.user.role === 'institution' && req.user._id.toString() === certificate.institutionId.toString();

    if (!isAdmin && !isVerifier && !isIssuer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify this certificate'
      });
    }

    if (certificate.isRevoked) {
      return res.status(400).json({
        success: false,
        message: 'Cannot verify a revoked certificate'
      });
    }

    certificate.isVerified = true;
    certificate.verifiedBy = req.user._id;
    certificate.verifiedAt = new Date();
    certificate.status = 'verified';

    await certificate.save();

    res.status(200).json({
      success: true,
      message: 'Certificate verified successfully',
      isValid: true
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Revoke certificate
// @route   POST /api/certificates/:id/revoke
// @access  Private (Institution owner or Admin)
router.post('/:id/revoke', protect, validateCertificateId, async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Revocation reason is required'
      });
    }

    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check permissions
    const isOwner = req.user._id.toString() === certificate.institutionId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to revoke this certificate'
      });
    }

    await certificate.revoke(req.user._id, reason);

    // Send revocation email notification
    try {
      console.log('📧 Sending revocation notification email...');

      const revocationData = {
        studentEmail: certificate.studentEmail,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        certificateType: certificate.certificateType,
        institutionName: certificate.institutionName,
        revocationDate: new Date(),
        revocationReason: reason,
        certificateId: certificate._id,
        contactEmail: req.user.email || 'coordinator@institution.edu'
      };

      const emailResult = await emailService.sendRevocationNotification(revocationData);

      if (emailResult.success) {
        console.log('✅ Revocation email sent successfully');
      } else {
        console.log('⚠️ Revocation email failed, but certificate was revoked');
      }
    } catch (emailError) {
      console.error('❌ Revocation email error:', emailError);
      // Don't fail revocation if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Certificate revoked and student notified via email'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;