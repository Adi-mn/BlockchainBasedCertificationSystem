require('dotenv').config();
const emailService = require('../utils/emailService');

async function quickEmailTest() {
  console.log('🧪 QUICK EMAIL TEST');
  console.log('==================');
  
  // Check environment variables first
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-gmail@gmail.com') {
    console.log('❌ EMAIL_USER not configured in .env file');
    console.log('Please update backend/.env with your Gmail address');
    return;
  }
  
  if (!process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_APP_PASSWORD === 'your-16-character-app-password') {
    console.log('❌ EMAIL_APP_PASSWORD not configured in .env file');
    console.log('Please update backend/.env with your Gmail App Password');
    return;
  }
  
  console.log(`📧 Testing email with: ${process.env.EMAIL_USER}`);
  
  // Test email configuration
  try {
    const configValid = await emailService.testEmailConfiguration();
    if (!configValid) {
      console.log('❌ Email configuration invalid');
      return;
    }
    console.log('✅ Email configuration valid');
  } catch (error) {
    console.log('❌ Email configuration error:', error.message);
    return;
  }
  
  // Send test email
  try {
    const testData = {
      studentEmail: process.env.EMAIL_USER, // Send to yourself for testing
      studentName: 'Test Student',
      courseName: 'Advanced Web Development',
      certificateType: 'Course Completion Certificate',
      institutionName: 'Test University',
      issueDate: new Date(),
      certificateId: 'TEST-' + Date.now(),
      verificationUrl: 'http://localhost:3000/certificate/TEST123',
      language: 'english'
    };
    
    console.log('\n📤 Sending test certificate email...');
    const result = await emailService.sendCertificateNotification(testData);
    
    if (result.success) {
      console.log('✅ SUCCESS! Test email sent successfully!');
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`👤 Sent to: ${result.recipient}`);
      console.log('\n🎉 Email system is working! Check your inbox.');
      console.log('📧 Now students will receive emails when certificates are generated.');
    } else {
      console.log('❌ FAILED! Test email failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Test email error:', error.message);
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. If test email succeeded, generate a certificate to test with students');
  console.log('2. If test email failed, check Gmail settings and App Password');
  console.log('3. Make sure to restart backend server after changing .env');
}

quickEmailTest().catch(console.error);