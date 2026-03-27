const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/certificate-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function listCertificates() {
  console.log('📋 LISTING ALL CERTIFICATES');
  console.log('============================================================');
  
  try {
    const certificates = await Certificate.find({}).limit(10);
    
    if (certificates.length === 0) {
      console.log('❌ No certificates found in database');
      return;
    }
    
    console.log(`✅ Found ${certificates.length} certificates:`);
    
    certificates.forEach((cert, index) => {
      console.log(`\n${index + 1}. Certificate ID: ${cert._id}`);
      console.log(`   Student: ${cert.studentName}`);
      console.log(`   Course: ${cert.courseName}`);
      console.log(`   Institution: ${cert.institutionName}`);
      console.log(`   Verified: ${cert.isVerified ? '✅' : '❌'}`);
      console.log(`   Date: ${new Date(cert.issueDate).toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

listCertificates();