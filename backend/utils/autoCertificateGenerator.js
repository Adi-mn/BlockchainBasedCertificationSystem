const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const CertificateTemplateEngine = require('./certificateTemplates');

class AutoCertificateGenerator {
  constructor() {
    this.templateEngine = new CertificateTemplateEngine();
  }

  // Get available templates
  getAvailableTemplates() {
    return this.templateEngine.getTemplates();
  }

  // Get supported languages (all 22 Indian languages)
  getSupportedLanguages() {
    return this.templateEngine.getSupportedLanguages();
  }

  // Generate certificate preview
  async generatePreview(certificateData) {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0
    });

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    return new Promise(async (resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');
        resolve(`data:application/pdf;base64,${base64}`);
      });

      try {
        // Add verification URL to data
        const verificationUrl = `${process.env.FRONTEND_URL || 'https://certverify.com'}/verify/${certificateData.certificateId}`;
        certificateData.verificationUrl = verificationUrl;

        // Draw certificate using template engine
        await this.templateEngine.drawCertificate(doc, certificateData, certificateData.template);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate final PDF certificate
  async generatePDF(certificateData) {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0,
      info: {
        Title: `Certificate - ${certificateData.studentName}`,
        Author: certificateData.instituteName,
        Subject: `${certificateData.courseName} Certificate`,
        Keywords: 'certificate, blockchain, verification',
        Creator: 'Blockchain Certificate System',
        Producer: 'Auto Certificate Generator'
      }
    });

    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));

    return new Promise(async (resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      try {
        // Add verification URL to data
        const verificationUrl = `${process.env.FRONTEND_URL || 'https://certverify.com'}/verify/${certificateData.certificateId}`;
        certificateData.verificationUrl = verificationUrl;

        // Draw certificate using template engine
        await this.templateEngine.drawCertificate(doc, certificateData, certificateData.template);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Generate QR code for verification
  async generateQRCode(verificationUrl) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code: ' + error.message);
    }
  }

  // Main auto-certificate generation function
  async generateAutoCertificate(inputData) {
    try {
      // Validate input data
      this.validateInputData(inputData);

      // Prepare certificate data
      const certificateData = {
        studentName: inputData.studentName,
        courseName: inputData.courseName,
        teacherName: inputData.teacherName,
        instituteName: inputData.instituteName,
        certificateId: inputData.certificateId,
        issuedDate: inputData.issuedDate || new Date().toISOString(),
        grade: inputData.grade || '',
        description: inputData.description || '',
        language: inputData.language || 'english',
        template: inputData.template || 'classic',
        logoUrl: inputData.logoUrl || '',
        signature: inputData.signature || 'auto',
        seal: inputData.seal || 'auto'
      };

      // Generate preview
      const previewImage = await this.generatePreview(certificateData);

      // Generate final PDF
      const pdfBuffer = await this.generatePDF(certificateData);

      // Generate verification URL and QR code
      const verificationUrl = `${process.env.FRONTEND_URL || 'https://certverify.com'}/verify/${certificateData.certificateId}`;
      const qrCode = await this.generateQRCode(verificationUrl);

      return {
        message: "Certificate created successfully",
        preview_image: previewImage,
        pdf_buffer: pdfBuffer,
        qr_code: qrCode,
        verification_link: verificationUrl,
        language_used: certificateData.language,
        template_used: certificateData.template,
        certificate_data: certificateData
      };

    } catch (error) {
      throw new Error('Auto certificate generation failed: ' + error.message);
    }
  }

  // Validate input data
  validateInputData(data) {
    const required = ['studentName', 'courseName', 'teacherName', 'instituteName', 'certificateId'];

    for (const field of required) {
      if (!data[field] || data[field].trim() === '') {
        throw new Error(`${field} is required`);
      }
    }

    // Validate language
    const supportedLanguages = this.getSupportedLanguages().map(lang => lang.code);
    if (data.language && !supportedLanguages.includes(data.language.toLowerCase())) {
      throw new Error(`Language ${data.language} is not supported`);
    }

    // Validate template
    const availableTemplates = this.getAvailableTemplates().map(template => template.id);
    if (data.template && !availableTemplates.includes(data.template.toLowerCase())) {
      throw new Error(`Template ${data.template} is not available`);
    }
  }

  // Get certificate metadata for blockchain storage
  getCertificateMetadata(certificateData) {
    return {
      student_name: certificateData.studentName,
      course_name: certificateData.courseName,
      issued_date: certificateData.issuedDate,
      certificate_id: certificateData.certificateId,
      issuing_authority: certificateData.instituteName,
      instructor: certificateData.teacherName,
      language: certificateData.language,
      template: certificateData.template
    };
  }

  // Generate template preview images (for UI selection)
  async generateTemplatePreview(templateId, language = 'english') {
    const sampleData = {
      studentName: 'Sample Student Name',
      courseName: 'Sample Course Name',
      teacherName: 'Sample Teacher',
      instituteName: 'Sample Institute',
      certificateId: 'SAMPLE-001',
      issuedDate: new Date().toISOString(),
      grade: 'A+',
      description: 'Outstanding Performance',
      language: language,
      template: templateId
    };

    return await this.generatePreview(sampleData);
  }

  // Get template information
  getTemplateInfo(templateId) {
    const templates = this.getAvailableTemplates();
    return templates.find(template => template.id === templateId);
  }

  // Get language information
  getLanguageInfo(languageCode) {
    const languages = this.getSupportedLanguages();
    return languages.find(lang => lang.code === languageCode.toLowerCase());
  }
}

module.exports = AutoCertificateGenerator;