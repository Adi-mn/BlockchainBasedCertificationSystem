require('dotenv').config();
const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const emailService = require('../utils/emailService');

async function debugCertificateEmail() {
  console.log('🔍 DEBUGGING CERTIFICATE EMAIL FLOW');
  console.log('====================================');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Find a recent certificate
    const recentCertificate = await Certificate.findOne().sort({ createdAt: -1 });
    
    if (!recentCertificate) {
      console.log('❌ No certificates found in database');
      console.log('💡 Generate a certificate first, then run this script');
      return;
    }
    
    console.log('\n📋 FOUND RECENT CERTIFICATE:');
    console.log('ID:', recentCertificate._id);
    console.log('Student Name:', recentCertificate.studentName);
    console.log('Student Email:', recentCertificate.studentEmail);
    console.log('Course Name:', recentCertificate.courseName);
    console.log('Institution:', recentCertificate.institutionName);
    console.log('Created:', recentCertificate.createdAt);
    
    // Test email with this certificate data
    console.log('\n📧 TESTING EMAIL WITH CERTIFICATE DATA:');
    
    const emailData = {
      studentEmail: recentCertificate.studentEmail,
      studentName: recentCertificate.studentName,
      courseName: recentCertificate.courseName,
      certificateType: recentCertificate.certificateType || 'Certificate',
      institutionName: recentCertificate.institutionName,
      issueDate: recentCertificate.issueDate || recentCertificate.createdAt,
      certificateId: recentCertificate._id,
      verificationUrl: `http://localhost:3000/certificate/${recentCertificate._id}`,
      language: recentCertificate.language || 'english'
    };
    
    console.log('Email will be sent to:', emailData.studentEmail);
    
    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.studentEmail)) {
      console.log('❌ Invalid email address format:', emailData.studentEmail);
      return;
    }
    
    // Test email configuration
    const configValid = await emailService.testEmailConfiguration();
    if (!configValid) {
      console.log('❌ Email configuration invalid - check your Gmail settings');
      return;
    }
    
    // Send email
    const result = await emailService.sendCertificateNotification(emailData);
    
    if (result.success) {
      console.log('✅ SUCCESS! Email sent to student');
      console.log('Message ID:', result.messageId);
      console.log('\n🎉 The email system is working correctly!');
      console.log('📧 Students should receive emails when certificates are generated.');
    } else {
      console.log('❌ FAILED! Email not sent:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from database');
  }
}

debugCertificateEmail().catch(console.error);