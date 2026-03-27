const nodemailer = require('nodemailer');

/**
 * 📧 AUTOMATIC EMAIL NOTIFICATION SERVICE
 * Sends professional certificate notifications using free Gmail SMTP
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter with Gmail SMTP (FREE)
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use TLS
        auth: {
          user: process.env.EMAIL_USER, // Gmail address
          pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
    }
  }

  /**
   * Generate professional HTML email template
   */
  generateEmailTemplate(certificateData) {
    const {
      studentName,
      courseName,
      certificateType,
      institutionName,
      issueDate,
      certificateId,
      verificationUrl,
      language = 'english'
    } = certificateData;

    const formattedDate = new Date(issueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Issued</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 20px; border: 1px solid #e2e8f0; }
        .footer { background: #f8fafc; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
        .verify-button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎓 Certificate Issued Successfully!</h1>
    </div>
    <div class="content">
        <p>Dear ${studentName},</p>
        <p><strong>Congratulations! 🎉</strong></p>
        <p>We are delighted to inform you that your <strong>${certificateType}</strong> for the program <strong>"${courseName}"</strong> has been successfully issued by <strong>${institutionName}</strong>.</p>
        
        <h3>📋 Certificate Details</h3>
        <ul>
            <li><strong>Student Name:</strong> ${studentName}</li>
            <li><strong>Course/Program:</strong> ${courseName}</li>
            <li><strong>Certificate Type:</strong> ${certificateType}</li>
            <li><strong>Issuing Institution:</strong> ${institutionName}</li>
            <li><strong>Issue Date:</strong> ${formattedDate}</li>
            <li><strong>Language:</strong> ${language.charAt(0).toUpperCase() + language.slice(1)}</li>
        </ul>

        <h3>🔐 Student Account Created</h3>
        <p>An account has been automatically created for you to access and manage your certificates.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Login URL:</strong> <a href="http://localhost:3000/login">http://localhost:3000/login</a></p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${certificateData.studentEmail}</p>
            <p style="margin: 5px 0;"><strong>Default Password:</strong> password123</p>
            <p style="font-size: 12px; color: #6b7280; margin-top: 5px;">(Please change your password after logging in)</p>
        </div>
        
        <h3>🔐 Certificate Verification</h3>
        <p>Your certificate is secured on the blockchain and can be verified anytime:</p>
        <p><a href="${verificationUrl}" class="verify-button" target="_blank">🔍 Verify Certificate Online</a></p>
        <p><strong>Certificate ID:</strong> ${certificateId}</p>
        
        <p><strong>What's Next?</strong></p>
        <ul>
            <li>Download your certificate from the verification link above</li>
            <li>Share your achievement on social media</li>
            <li>Keep the certificate ID safe for future reference</li>
        </ul>
        
        <p>We wish you great success in your future endeavors!</p>
    </div>
    <div class="footer">
        <p><strong>Best Regards,</strong><br>${institutionName}<br>Blockchain Certificate Verification System</p>
        <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>`;
  }

  /**
   * Generate revocation email template
   */
  generateRevocationEmailTemplate(revocationData) {
    const {
      studentName,
      courseName,
      certificateType,
      institutionName,
      revocationDate,
      revocationReason,
      certificateId,
      contactEmail = 'coordinator@institution.edu'
    } = revocationData;

    const formattedDate = new Date(revocationDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Revoked</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 20px; border: 1px solid #e2e8f0; }
        .footer { background: #f8fafc; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
        .warning-box { background: #fef2f2; border: 2px solid #fca5a5; border-radius: 6px; padding: 15px; margin: 15px 0; }
        .contact-button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        .reason-box { background: #f9fafb; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚫 Certificate Revoked</h1>
    </div>
    <div class="content">
        <p>Dear ${studentName},</p>
        
        <div class="warning-box">
            <p><strong>⚠️ Important Notice</strong></p>
            <p>We regret to inform you that your certificate has been revoked by ${institutionName}.</p>
        </div>
        
        <h3>📋 Certificate Details</h3>
        <ul>
            <li><strong>Student Name:</strong> ${studentName}</li>
            <li><strong>Course/Program:</strong> ${courseName}</li>
            <li><strong>Certificate Type:</strong> ${certificateType}</li>
            <li><strong>Issuing Institution:</strong> ${institutionName}</li>
            <li><strong>Revocation Date:</strong> ${formattedDate}</li>
            <li><strong>Certificate ID:</strong> ${certificateId}</li>
        </ul>
        
        <div class="reason-box">
            <h3>📝 Reason for Revocation</h3>
            <p>${revocationReason}</p>
        </div>
        
        <h3>📞 Next Steps</h3>
        <p>If you have any questions or concerns about this revocation, please contact our college coordinator:</p>
        <p><a href="mailto:${contactEmail}" class="contact-button">📧 Contact College Coordinator</a></p>
        
        <p><strong>Important:</strong></p>
        <ul>
            <li>This certificate is no longer valid</li>
            <li>Any copies should be destroyed</li>
            <li>Contact the coordinator for clarification</li>
            <li>You may be eligible for re-certification</li>
        </ul>
        
        <p>We apologize for any inconvenience this may cause.</p>
    </div>
    <div class="footer">
        <p><strong>Best Regards,</strong><br>${institutionName}<br>Certificate Management System</p>
        <p style="font-size: 12px;">This is an automated message. Please contact the coordinator for assistance.</p>
    </div>
</body>
</html>`;
  }

  /**
   * Send certificate revocation notification email
   */
  async sendRevocationNotification(revocationData) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const {
        studentEmail,
        studentName,
        courseName,
        institutionName,
        certificateId
      } = revocationData;

      // Generate email content
      const htmlContent = this.generateRevocationEmailTemplate(revocationData);
      const subject = `🚫 Certificate Revoked - ${courseName} - ${institutionName}`;

      // Email options
      const mailOptions = {
        from: {
          name: `${institutionName} - Certificate System`,
          address: process.env.EMAIL_USER
        },
        to: studentEmail,
        subject: subject,
        html: htmlContent
      };

      // Send email
      console.log(`📧 Sending revocation notification to: ${studentEmail}`);
      const result = await this.transporter.sendMail(mailOptions);

      console.log('✅ Revocation email sent successfully!');
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`👤 Recipient: ${studentEmail}`);
      console.log(`🚫 Certificate: ${courseName}`);

      return {
        success: true,
        messageId: result.messageId,
        recipient: studentEmail
      };
    } catch (error) {
      console.error('❌ Failed to send revocation email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
    * Send certificate notification email
    */
  async sendCertificateNotification(certificateData, pdfBuffer = null) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const {
        studentEmail,
        studentName,
        courseName,
        institutionName,
        certificateId
      } = certificateData;

      // Generate email content
      const htmlContent = this.generateEmailTemplate(certificateData);
      const subject = `🎓 Your Certificate Has Been Issued – ${institutionName}`;

      // Email options
      const mailOptions = {
        from: {
          name: `${institutionName} - Certificate System`,
          address: process.env.EMAIL_USER
        },
        to: studentEmail,
        subject: subject,
        html: htmlContent,
        attachments: []
      };

      // Attach PDF if provided
      if (pdfBuffer) {
        const filename = `${studentName.replace(/\s+/g, '_')}_${courseName.replace(/\s+/g, '_')}_Certificate.pdf`;
        mailOptions.attachments.push({
          filename: filename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        });
      }

      // Send email
      console.log(`📧 Sending certificate notification to: ${studentEmail}`);
      const result = await this.transporter.sendMail(mailOptions);

      console.log('✅ Certificate email sent successfully!');
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`👤 Recipient: ${studentEmail}`);
      console.log(`📋 Certificate: ${courseName}`);

      return {
        success: true,
        messageId: result.messageId,
        recipient: studentEmail
      };
    } catch (error) {
      console.error('❌ Failed to send certificate email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration() {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      await this.transporter.verify();
      console.log('✅ Email configuration is valid');
      return true;
    } catch (error) {
      console.error('❌ Email configuration test failed:', error);
      return false;
    }
  }


  /**
   * Generate OTP email template
   */
  generateOTPTemplate(otp) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 20px; border: 1px solid #e2e8f0; }
        .footer { background: #f8fafc; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
        .otp-box { background: #f0fdf4; border: 2px dashed #16a34a; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #166534; }
        .warning-text { color: #dc2626; font-size: 14px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
        <p>Hello,</p>
        <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to complete the process:</p>
        
        <div class="otp-box">
            ${otp}
        </div>
        
        <p><strong>This OTP is valid for 10 minutes.</strong></p>
        
        <p class="warning-text">⚠️ If you did not request this password reset, please ignore this email and secure your account.</p>
    </div>
    <div class="footer">
        <p><strong>Blockchain Certificate Verification System</strong></p>
        <p style="font-size: 12px;">This is an automated message. Please do not reply.</p>
    </div>
</body>
</html>`;
  }

  /**
   * Send OTP email
   */
  async sendOTP(email, otp) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const htmlContent = this.generateOTPTemplate(otp);
      const subject = '🔐 Password Reset OTP - Action Required';

      const mailOptions = {
        from: {
          name: 'Certificate System Security',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: subject,
        html: htmlContent
      };

      console.log(`📧 Sending OTP to: ${email}`);
      await this.transporter.sendMail(mailOptions);
      console.log('✅ OTP sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to send OTP:', error);
      return false;
    }
  }

  /**
   * Generate Password Reset Success Template
   */
  generateResetSuccessTemplate() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 20px; border: 1px solid #e2e8f0; }
        .footer { background: #f8fafc; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Password Changed Successfully</h1>
    </div>
    <div class="content">
        <p>Hello,</p>
        <p>Your password has been successfully updated.</p>
        <p>You can now login with your new credentials.</p>
        
        <p style="color: #dc2626; margin-top: 20px;"><strong>If you did not make this change, please contact support immediately.</strong></p>
    </div>
    <div class="footer">
        <p><strong>Blockchain Certificate Verification System</strong></p>
    </div>
</body>
</html>`;
  }

  /**
   * Send Password Reset Success Email
   */
  async sendPasswordResetSuccess(email) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const htmlContent = this.generateResetSuccessTemplate();
      const subject = '✅ Password Changed Successfully';

      const mailOptions = {
        from: {
          name: 'Certificate System Security',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: subject,
        html: htmlContent
      };

      console.log(`📧 Sending success email to: ${email}`);
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('❌ Failed to send success email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();