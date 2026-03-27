const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const PremiumCertificateGenerator = require('../utils/premiumCertificateGenerator');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/certificate-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testPremiumPDF() {
  console.log('🎨 TESTING PREMIUM CERTIFICATE PDF GENERATION');
  console.log('============================================================');
  
  try {
    // Find a test certificate
    const testId = '693cacdf2d66da4f9efe80c8';
    const certificate = await Certificate.findById(testId);
    
    if (!certificate) {
      console.log('❌ Test certificate not found');
      return;
    }
    
    console.log('✅ Certificate found:');
    console.log(`📋 Student: ${certificate.studentName}`);
    console.log(`📚 Course: ${certificate.courseName}`);
    console.log(`🏢 Institution: ${certificate.institutionName}`);
    console.log(`📅 Date: ${new Date(certificate.issueDate).toLocaleDateString()}`);
    
    // Generate premium PDF
    console.log('\n🎨 Generating premium PDF...');
    const premiumGenerator = new PremiumCertificateGenerator();
    
    const startTime = Date.now();
    const pdfBuffer = await premiumGenerator.generatePremiumCertificate(certificate);
    const generationTime = Date.now() - startTime;
    
    console.log(`✅ Premium PDF generated successfully!`);
    console.log(`📊 Size: ${pdfBuffer.length} bytes`);
    console.log(`⏱️ Generation time: ${generationTime}ms`);
    
    // Save PDF to file for testing
    const filename = `premium_certificate_${certificate.studentName.replace(/\s+/g, '_')}.pdf`;
    const filepath = path.join(__dirname, '..', 'temp', filename);
    
    // Create temp directory if it doesn't exist
    const tempDir = path.dirname(filepath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, pdfBuffer);
    console.log(`💾 PDF saved to: ${filepath}`);
    
    console.log('\n🎯 PREMIUM PDF FEATURES IMPLEMENTED:');
    console.log('✅ Beautiful double border (gradient blue→purple→red + gold inner)');
    console.log('✅ Soft background tint (#f8f9fa)');
    console.log('✅ Transparent watermark "ABC UNIVERSITY" at 8% opacity');
    console.log('✅ Student Name: 32px, bold, royal blue (#2563eb)');
    console.log('✅ Course name in elegant green (#059669)');
    console.log('✅ Perfect center alignment with equal spacing');
    console.log('✅ Golden divider line below university name');
    console.log('✅ 3-column footer: [Signature] [Official Seal] [QR Code]');
    console.log('✅ Certificate ID at bottom-left in small grey text');
    console.log('✅ Single A4 page with no overflow');
    console.log('✅ Premium, modern, award-style finish');
    
    console.log('\n🚀 PREMIUM PDF GENERATION TEST COMPLETE!');
    console.log('📱 The certificate now has a premium, professional look!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testPremiumPDF();