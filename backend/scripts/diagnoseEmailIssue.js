require('dotenv').config();
const emailService = require('../utils/emailService');

async function diagnoseEmailIssue() {
  console.log('🔍 DIAGNOSING EMAIL NOTIFICATION ISSUE');
  console.log('============================================================');
  
  // Check 1: Environment Variables
  console.log('\n📋 CHECKING ENVIRONMENT VARIABLES:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
  console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? '✅ Set' : '❌ Not set');
  console.log('EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME ? '✅ Set' : '❌ Not set');
  
  if (process.env.EMAIL_USER === 'your-gmail@gmail.com') {
    console.log('⚠️  EMAIL_USER is still placeholder value!');
  }
  
  if (process.env.EMAIL_APP_PASSWORD === 'your-16-character-app-password') {
    console.log('⚠️  EMAIL_APP_PASSWORD is still placeholder value!');
  }
  
  // Check 2: Email Service Initialization
  console.log('\n🔧 CHECKING EMAIL SERVICE:');
  try {
    const configValid = await emailService.testEmailConfiguration();
    if (configValid) {
      console.log('✅ Email configuration is valid');
    } else {
      console.log('❌ Email configuration is invalid');
    }
  } catch (error) {
    console.log('❌ Email configuration test failed:', error.message);
  }
  
  // Check 3: Test Email Send
  console.log('\n📧 TESTING EMAIL SEND:');
  if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your-gmail@gmail.com') {
    try {
      const testData = {
        studentEmail: process.env.EMAIL_USER, // Send to yourself for testing
        studentName: 'Test Student',
        courseName: 'Test Course',
        certificateType: 'Test Certificate',
        institutionName: 'Test Institution',
        issueDate: new Date(),
        certificateId: 'TEST123',
        verificationUrl: 'http://localhost:3000/certificate/TEST123',
        language: 'english'
      };
      
      console.log(`Sending test email to: ${testData.studentEmail}`);
      const result = await emailService.sendCertificateNotification(testData);
      
      if (result.success) {
        console.log('✅ Test email sent successfully!');
        console.log(`Message ID: ${result.messageId}`);
      } else {
        console.log('❌ Test email failed:', result.error);
      }
    } catch (error) {
      console.log('❌ Test email error:', error.message);
    }
  } else {
    console.log('⚠️  Cannot test email - EMAIL_USER not configured');
  }
  
  console.log('\n🔧 TROUBLESHOOTING STEPS:');
  console.log('============================================================');
  
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-gmail@gmail.com') {
    console.log('1. ❌ UPDATE EMAIL_USER in backend/.env');
    console.log('   Replace "your-gmail@gmail.com" with your actual Gmail address');
  } else {
    console.log('1. ✅ EMAIL_USER is configured');
  }
  
  if (!process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_APP_PASSWORD === 'your-16-character-app-password') {
    console.log('2. ❌ UPDATE EMAIL_APP_PASSWORD in backend/.env');
    console.log('   Steps to get Gmail App Password:');
    console.log('   a. Go to https://myaccount.google.com/');
    console.log('   b. Security → 2-Step Verification (enable if not enabled)');
    console.log('   c. Security → App passwords');
    console.log('   d. Select "Mail" and generate password');
    console.log('   e. Copy the 16-character password to .env file');
  } else {
    console.log('2. ✅ EMAIL_APP_PASSWORD is configured');
  }
  
  console.log('3. 🔄 RESTART the backend server after updating .env');
  console.log('4. 🧪 TEST by generating a certificate');
  
  console.log('\n📧 EXAMPLE .env CONFIGURATION:');
  console.log('EMAIL_USER=yourname@gmail.com');
  console.log('EMAIL_APP_PASSWORD=abcdefghijklmnop');
  console.log('EMAIL_FROM_NAME=Certificate Verification System');
}

diagnoseEmailIssue().catch(console.error);