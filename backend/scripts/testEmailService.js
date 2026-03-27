const emailService = require('../utils/emailService');

async function testEmailService() {
  console.log('📧 TESTING EMAIL NOTIFICATION SERVICE');
  console.log('============================================================');
  
  try {
    // Test email configuration
    console.log('🔧 Testing email configuration...');
    const configValid = await emailService.testEmailConfiguration();
    
    if (!configValid) {
      console.log('❌ Email configuration invalid. Please check your .env settings.');
      return;
    }

    // Test certificate email
    console.log('📧 Testing certificate notification email...');
    const testCertificateData = {
      studentEmail: 'test.student@example.com', // Change this to your test email
      studentName: 'John Doe',
      courseName: 'Advanced Web Development',
      certificateType: 'Course Completion',
      institutionName: 'ABC University',
      issueDate: new Date(),
      certificateId: 'TEST123456789',
      verificationUrl: 'http://localhost:3000/certificate/TEST123456789',
      language: 'english'
    };

    const result = await emailService.sendCertificateNotification(testCertificateData);
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`👤 Sent to: ${result.recipient}`);
    } else {
      console.log('❌ Test email failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Email service test failed:', error);
  }

  console.log('\n📧 EMAIL SERVICE TEST COMPLETE');
  console.log('============================================================');
  console.log('🔧 SETUP INSTRUCTIONS:');
  console.log('1. Update backend/.env with your Gmail credentials');
  console.log('2. Enable 2FA and generate App Password in Gmail');
  console.log('3. Test with your own email address');
  console.log('4. Email notifications will be sent automatically on certificate generation');
}

testEmailService();