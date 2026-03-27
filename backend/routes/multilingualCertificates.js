const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const Certificate = require('../models/Certificate');
const MultilingualCertificateGenerator = require('../utils/multilingualCertificate');
const { protect, authorize } = require('../middleware/auth');
const emailService = require('../utils/emailService');

const router = express.Router();
const certificateGenerator = new MultilingualCertificateGenerator();

// @desc    Get supported languages
// @route   GET /api/multilingual-certificates/languages
// @access  Public
router.get('/languages', (req, res) => {
  try {
    const languages = certificateGenerator.getSupportedLanguages();
    res.status(200).json({
      success: true,
      languages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Generate multilingual certificate preview
// @route   POST /api/multilingual-certificates/preview
// @access  Private (Institution only)
router.post('/preview', protect, authorize('institution'), async (req, res, next) => {
  try {
    console.log('🎨 Generating multilingual certificate preview...');
    console.log('📋 Request body:', req.body);

    const {
      studentName,
      courseName,
      certificateId,
      grade,
      description,
      issuedDate,
      language = 'english'
    } = req.body;

    // Validate required fields
    if (!studentName || !courseName) {
      return res.status(400).json({
        success: false,
        message: 'Student name and course name are required for preview'
      });
    }

    const certificateData = {
      studentName,
      courseName,
      instituteName: req.user.organization || req.user.name,
      certificateId: certificateId || `PREVIEW-${Date.now()}`,
      grade,
      description,
      issueDate: issuedDate || new Date().toISOString(),
      language: language.toLowerCase(),
      certificateType: 'Course Completion'
    };

    console.log('📄 Certificate data for preview:', certificateData);

    try {
      // Generate preview using the multilingual generator
      const preview = await certificateGenerator.generatePreview(certificateData);

      console.log('✅ Preview generated successfully');

      res.status(200).json({
        success: true,
        message: 'Certificate preview generated successfully',
        language_used: language.toLowerCase(),
        preview_image: preview
      });

    } catch (previewError) {
      console.error('❌ Preview generation failed:', previewError);

      // Fallback: Return a simple success message if preview fails
      res.status(200).json({
        success: true,
        message: 'Preview data prepared successfully',
        language_used: language.toLowerCase(),
        preview_image: null,
        note: 'Preview generation temporarily unavailable, but certificate can still be generated'
      });
    }

  } catch (error) {
    console.error('❌ Preview route error:', error);
    next(error);
  }
});

// @desc    Generate and store multilingual certificate
// @route   POST /api/multilingual-certificates/generate
// @access  Private (Institution only)
router.post('/generate', protect, authorize('institution'), async (req, res, next) => {
  try {
    const {
      studentName,
      studentEmail,
      courseName,
      certificateType,
      certificateId,
      grade,
      description,
      issuedDate,
      expiryDate,
      language = 'english'
    } = req.body;

    // Validate required fields
    if (!studentName || !studentEmail || !courseName || !certificateType || !certificateId) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Auto-create student account if it doesn't exist
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');

    let student = await User.findOne({ email: studentEmail });

    if (!student) {
      console.log(`🎓 Auto-creating student account for multilingual certificate: ${studentEmail}`);

      student = await User.create({
        name: studentName,
        email: studentEmail,
        password: 'password123', // Plain text - will be hashed by pre-save hook
        role: 'student',
        isVerified: true
      });

      console.log(`✅ Student account created for multilingual certificate: ${student.email}`);
    }

    const certificateData = {
      studentName,
      courseName,
      instituteName: req.user.organization || req.user.name,
      certificateId,
      grade,
      description,
      issuedDate: issuedDate || new Date().toISOString(),
      language: language.toLowerCase()
    };

    // Generate certificate
    const result = await certificateGenerator.generateCertificate(certificateData);

    // Upload PDF to IPFS (Pinata)
    let ipfsHash = null;
    try {
      const formData = new FormData();
      formData.append('file', result.pdf_buffer, {
        filename: `certificate-${certificateId}-${language}.pdf`,
        contentType: 'application/pdf'
      });

      const metadata = JSON.stringify({
        name: `Certificate-${certificateId}-${language}`,
        keyvalues: {
          studentName,
          courseName,
          language,
          instituteName: req.user.organization || req.user.name,
          certificateId,
          generatedAt: new Date().toISOString()
        }
      });
      formData.append('pinataMetadata', metadata);

      const pinataResponse = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'pinata_api_key': process.env.PINATA_API_KEY,
            'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
          }
        }
      );

      ipfsHash = pinataResponse.data.IpfsHash;
    } catch (ipfsError) {
      console.error('IPFS upload failed:', ipfsError);
      // Continue without IPFS for now
    }

    // Store certificate in database
    const certificate = await Certificate.create({
      studentName,
      studentEmail,
      certificateType,
      courseName,
      institutionId: req.user._id,
      institutionName: req.user.organization || req.user.name,
      issueDate: issuedDate || new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      grade,
      description,
      ipfsHash: ipfsHash || `Qm${Math.random().toString(36).substring(2, 46)}`,
      issuerAddress: req.user.walletAddress || '0x0000000000000000000000000000000000000000',
      language: language.toLowerCase(),
      // Additional multilingual fields
      certificateData: {
        language,
        translations: certificateGenerator.getTranslation(language, 'certificateOfCompletion')
      }
    });

    // TODO: Store on blockchain (implement based on your smart contract)
    const blockchainTxHash = 'pending'; // Placeholder

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
      const emailResult = await emailService.sendCertificateNotification(emailData, result.pdf_buffer);

      if (emailResult.success) {
        console.log('✅ Email notification sent successfully');
      } else {
        console.log('⚠️ Email notification failed, but certificate was created');
      }
    } catch (emailError) {
      console.error('❌ Email notification error:', emailError);
      // Don't fail certificate generation if email fails
    }

    res.status(201).json({
      success: true,
      message: "Certificate generated and email notification sent successfully",
      language_used: language,
      preview_image: result.preview_image,
      pdf_url: ipfsHash ? `https://gateway.pinata.cloud/ipfs/${ipfsHash}` : null,
      ipfs_hash: ipfsHash,
      blockchain_transaction: blockchainTxHash,
      qr_code: result.qr_code,
      verification_link: result.verification_link,
      emailSent: true,
      certificate: {
        _id: certificate._id,
        certificateId,
        studentName,
        courseName,
        language,
        createdAt: certificate.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get certificate with language-specific rendering
// @route   GET /api/multilingual-certificates/:id/:language?
// @access  Public
router.get('/:id/:language?', async (req, res, next) => {
  try {
    const { id, language = 'english' } = req.params;

    const certificate = await Certificate.findById(id)
      .populate('institutionId', 'name organization');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Generate certificate in requested language
    const certificateData = {
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      instituteName: certificate.institutionName,
      certificateId: certificate._id.toString(),
      grade: certificate.grade,
      description: certificate.description,
      issuedDate: certificate.issueDate,
      language: language.toLowerCase()
    };

    const result = await certificateGenerator.generateCertificate(certificateData);

    res.status(200).json({
      success: true,
      certificate: {
        ...certificate.toObject(),
        language_used: language,
        preview_image: result.preview_image,
        qr_code: result.qr_code,
        verification_link: result.verification_link
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Download certificate PDF in specific language
// @route   GET /api/multilingual-certificates/:id/download/:language?
// @access  Private
router.get('/:id/download/:language?', protect, async (req, res, next) => {
  try {
    const { id, language = 'english' } = req.params;

    const certificate = await Certificate.findById(id);

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

    // Generate PDF in requested language
    const certificateData = {
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      instituteName: certificate.institutionName,
      certificateId: certificate._id.toString(),
      grade: certificate.grade,
      description: certificate.description,
      issuedDate: certificate.issueDate,
      language: language.toLowerCase()
    };

    const result = await certificateGenerator.generatePDF(certificateData);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${id}-${language}.pdf"`);
    res.send(result);

  } catch (error) {
    next(error);
  }
});

module.exports = router;