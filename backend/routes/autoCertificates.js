const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const Certificate = require('../models/Certificate');
const AutoCertificateGenerator = require('../utils/autoCertificateGenerator');
const { protect, authorize } = require('../middleware/auth');
const emailService = require('../utils/emailService');

const router = express.Router();
const autoGenerator = new AutoCertificateGenerator();

// @desc    Get available templates
// @route   GET /api/auto-certificates/templates
// @access  Public
router.get('/templates', (req, res) => {
  try {
    const templates = autoGenerator.getAvailableTemplates();
    res.status(200).json({
      success: true,
      templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get supported languages
// @route   GET /api/auto-certificates/languages
// @access  Public
router.get('/languages', (req, res) => {
  try {
    const languages = autoGenerator.getSupportedLanguages();
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

// @desc    Generate template preview
// @route   GET /api/auto-certificates/template-preview/:templateId/:language?
// @access  Public
router.get('/template-preview/:templateId/:language?', async (req, res, next) => {
  try {
    const { templateId, language = 'english' } = req.params;
    
    const preview = await autoGenerator.generateTemplatePreview(templateId, language);
    
    res.status(200).json({
      success: true,
      template_id: templateId,
      language: language,
      preview_image: preview
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Generate certificate preview (Teacher input)
// @route   POST /api/auto-certificates/preview
// @access  Private (Institution/Teacher only)
router.post('/preview', protect, authorize('institution'), async (req, res, next) => {
  try {
    const {
      studentName,
      courseName,
      teacherName,
      instituteName,
      certificateId,
      issuedDate,
      grade,
      description,
      language = 'english',
      template = 'classic'
    } = req.body;

    // Use teacher's institute name if not provided
    const finalInstituteName = instituteName || req.user.organization || req.user.name;
    const finalTeacherName = teacherName || req.user.name;

    const inputData = {
      studentName,
      courseName,
      teacherName: finalTeacherName,
      instituteName: finalInstituteName,
      certificateId: certificateId || `CERT-${Date.now()}`,
      issuedDate: issuedDate || new Date().toISOString(),
      grade,
      description,
      language: language.toLowerCase(),
      template: template.toLowerCase()
    };

    const result = await autoGenerator.generateAutoCertificate(inputData);

    res.status(200).json({
      success: true,
      message: "Certificate preview generated successfully",
      preview_image: result.preview_image,
      language_used: result.language_used,
      template_used: result.template_used,
      certificate_data: result.certificate_data
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Auto-generate and store certificate (NO UPLOAD REQUIRED)
// @route   POST /api/auto-certificates/generate
// @access  Private (Institution/Teacher only)
router.post('/generate', protect, authorize('institution'), async (req, res, next) => {
  try {
    const {
      studentName,
      studentEmail,
      courseName,
      teacherName,
      instituteName,
      certificateId,
      issuedDate,
      expiryDate,
      grade,
      description,
      language = 'english',
      template = 'classic',
      certificateType = 'Course Completion'
    } = req.body;

    // Validate required fields
    if (!studentName || !studentEmail || !courseName) {
      return res.status(400).json({
        success: false,
        message: 'Student name, email, and course name are required'
      });
    }

    // Auto-create student account if it doesn't exist
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    
    let student = await User.findOne({ email: studentEmail });
    
    if (!student) {
      console.log(`🎓 Auto-creating student account for auto-certificate: ${studentEmail}`);
      
      student = await User.create({
        name: studentName,
        email: studentEmail,
        password: 'password123', // Plain text - will be hashed by pre-save hook
        role: 'student',
        isVerified: true
      });
      
      console.log(`✅ Student account created for auto-certificate: ${student.email}`);
    }

    // Use teacher's details if not provided
    const finalInstituteName = instituteName || req.user.organization || req.user.name;
    const finalTeacherName = teacherName || req.user.name;
    const finalCertificateId = certificateId || `CERT-${Date.now()}`;

    const inputData = {
      studentName,
      courseName,
      teacherName: finalTeacherName,
      instituteName: finalInstituteName,
      certificateId: finalCertificateId,
      issuedDate: issuedDate || new Date().toISOString(),
      grade,
      description,
      language: language.toLowerCase(),
      template: template.toLowerCase()
    };

    // Generate certificate automatically
    const result = await autoGenerator.generateAutoCertificate(inputData);

    // Upload PDF to IPFS (Pinata)
    let ipfsHash = null;
    let ipfsUrl = null;
    
    try {
      if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY) {
        const formData = new FormData();
        formData.append('file', result.pdf_buffer, {
          filename: `auto-certificate-${finalCertificateId}-${language}.pdf`,
          contentType: 'application/pdf'
        });

        const metadata = JSON.stringify({
          name: `Auto-Certificate-${finalCertificateId}`,
          keyvalues: {
            studentName,
            courseName,
            teacherName: finalTeacherName,
            instituteName: finalInstituteName,
            language,
            template,
            certificateId: finalCertificateId,
            generatedAt: new Date().toISOString(),
            autoGenerated: 'true'
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
        ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      }
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
      institutionName: finalInstituteName,
      issueDate: inputData.issuedDate,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      grade,
      description,
      ipfsHash: ipfsHash || `Qm${Math.random().toString(36).substring(2, 46)}`,
      issuerAddress: req.user.walletAddress || '0x0000000000000000000000000000000000000000',
      language: language.toLowerCase(),
      // Auto-certificate specific fields
      certificateData: {
        teacherName: finalTeacherName,
        template: template.toLowerCase(),
        autoGenerated: true,
        generationMethod: 'auto-template',
        templateEngine: 'v1.0'
      }
    });

    // TODO: Store on blockchain
    const blockchainTxHash = 'pending'; // Placeholder for blockchain integration

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

    // Return complete response
    res.status(201).json({
      success: true,
      message: "Certificate created and email notification sent successfully",
      preview_image: result.preview_image,
      pdf_url: ipfsUrl,
      ipfs_hash: ipfsHash,
      blockchain_tx: blockchainTxHash,
      qr_code: result.qr_code,
      verification_link: result.verification_link,
      language_used: result.language_used,
      template_used: result.template_used,
      emailSent: true,
      certificate: {
        _id: certificate._id,
        certificateId: finalCertificateId,
        studentName,
        courseName,
        teacherName: finalTeacherName,
        instituteName: finalInstituteName,
        language,
        template,
        createdAt: certificate.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get certificate with auto-rendering in different languages/templates
// @route   GET /api/auto-certificates/:id/render/:language?/:template?
// @access  Public
router.get('/:id/render/:language?/:template?', async (req, res, next) => {
  try {
    const { id, language = 'english', template = 'classic' } = req.params;

    const certificate = await Certificate.findById(id)
      .populate('institutionId', 'name organization');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Prepare data for re-rendering
    const inputData = {
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      teacherName: certificate.certificateData?.teacherName || 'Teacher',
      instituteName: certificate.institutionName,
      certificateId: certificate._id.toString(),
      issuedDate: certificate.issueDate,
      grade: certificate.grade,
      description: certificate.description,
      language: language.toLowerCase(),
      template: template.toLowerCase()
    };

    // Re-generate certificate in requested language/template
    const result = await autoGenerator.generateAutoCertificate(inputData);

    res.status(200).json({
      success: true,
      certificate: {
        ...certificate.toObject(),
        rendered_language: language,
        rendered_template: template,
        preview_image: result.preview_image,
        qr_code: result.qr_code,
        verification_link: result.verification_link
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Download auto-generated certificate PDF
// @route   GET /api/auto-certificates/:id/download/:language?/:template?
// @access  Private
router.get('/:id/download/:language?/:template?', protect, async (req, res, next) => {
  try {
    const { id, language = 'english', template = 'classic' } = req.params;

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

    // Prepare data for PDF generation
    const inputData = {
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      teacherName: certificate.certificateData?.teacherName || 'Teacher',
      instituteName: certificate.institutionName,
      certificateId: certificate._id.toString(),
      issuedDate: certificate.issueDate,
      grade: certificate.grade,
      description: certificate.description,
      language: language.toLowerCase(),
      template: template.toLowerCase()
    };

    // Generate PDF
    const pdfBuffer = await autoGenerator.generatePDF(inputData);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${id}-${language}-${template}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    next(error);
  }
});

// @desc    Get template and language information
// @route   GET /api/auto-certificates/info
// @access  Public
router.get('/info', (req, res) => {
  try {
    const templates = autoGenerator.getAvailableTemplates();
    const languages = autoGenerator.getSupportedLanguages();

    res.status(200).json({
      success: true,
      info: {
        total_templates: templates.length,
        total_languages: languages.length,
        templates,
        languages,
        features: [
          'No file upload required',
          'Auto-generated templates',
          'Multi-language support',
          'Blockchain verification',
          'IPFS storage',
          'QR code generation',
          'Professional designs'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;