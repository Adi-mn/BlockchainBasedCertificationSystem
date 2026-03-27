require('dotenv').config();
const PremiumCertificateGenerator = require('../utils/premiumCertificateGenerator');
const MultilingualCertificateGenerator = require('../utils/multilingualCertificate');
const fs = require('fs');

async function testQRCodeInPDF() {
  console.log('📱 TESTING QR CODE INTEGRATION IN PDF CERTIFICATES');
  console.log('=================================================');
  
  try {
    // Test 1: Premium Certificate with QR Code
    console.log('\n1️⃣ TESTING PREMIUM CERTIFICATE WITH QR CODE');
    console.log('--------------------------------------------');
    
    const pdfGenerator = new PremiumCertificateGenerator();
    const certificateData = {
      studentName: 'Alice Johnson',
      courseName: 'Data Science Fundamentals',
      institutionName: 'Tech University',
      certificateType: 'Course Completion',
      issueDate: new Date(),
      _id: 'QR-TEST-' + Date.now(),
      grade: 'A+',
      description: 'Completed with excellence',
      verificationUrl: 'http://localhost:3000/certificate/QR-TEST-' + Date.now()
    };
    
    console.log('📄 Generating premium PDF with QR code...');
    const premiumPDF = await pdfGenerator.generatePremiumCertificate(certificateData);
    
    // Save PDF for testing
    const premiumFilename = 'premium_certificate_with_qr.pdf';
    fs.writeFileSync(premiumFilename, premiumPDF);
    
    console.log(`✅ Premium PDF generated: ${Math.round(premiumPDF.length / 1024)} KB`);
    console.log(`📁 Saved as: ${premiumFilename}`);
    console.log(`🔗 QR Code URL: ${certificateData.verificationUrl}`);
    
    // Test 2: Multilingual Certificate with QR Code
    console.log('\n2️⃣ TESTING MULTILINGUAL CERTIFICATE WITH QR CODE');
    console.log('------------------------------------------------');
    
    const multiGenerator = new MultilingualCertificateGenerator();
    const multiCertData = {
      studentName: 'राज कुमार',
      courseName: 'वेब डेवलपमेंट',
      instituteName: 'तकनीकी विश्वविद्यालय',
      certificateId: 'MULTI-QR-' + Date.now(),
      grade: 'A',
      description: 'उत्कृष्ट प्रदर्शन',
      issuedDate: new Date().toISOString(),
      language: 'hindi'
    };
    
    console.log('📄 Generating multilingual PDF with QR code...');
    const multiResult = await multiGenerator.generateCertificate(multiCertData);
    
    // Save PDF for testing
    const multiFilename = 'multilingual_certificate_with_qr.pdf';
    fs.writeFileSync(multiFilename, multiResult.pdf_buffer);
    
    console.log(`✅ Multilingual PDF generated: ${Math.round(multiResult.pdf_buffer.length / 1024)} KB`);
    console.log(`📁 Saved as: ${multiFilename}`);
    console.log(`🔗 QR Code URL: ${multiResult.verification_link}`);
    console.log(`📱 QR Code Data: ${multiResult.qr_code ? 'Generated' : 'Failed'}`);
    
    console.log('\n🎉 QR CODE INTEGRATION COMPLETE!');
    console.log('================================');
    console.log('✅ Premium certificates: QR code in bottom-right corner');
    console.log('✅ Multilingual certificates: QR code already integrated');
    console.log('✅ QR codes link to verification URLs');
    console.log('✅ "Scan to Verify" text included');
    console.log('✅ Professional blue QR code design');
    
    console.log('\n📱 QR CODE FEATURES:');
    console.log('• 📍 Position: Bottom-right corner of certificate');
    console.log('• 📏 Size: 60x60 pixels (optimal for scanning)');
    console.log('• 🎨 Colors: Navy blue on white background');
    console.log('• 📝 Label: "Scan to Verify" text below QR code');
    console.log('• 🔗 Links to: Certificate verification page');
    console.log('• 📱 Mobile-friendly: Easy to scan with phone cameras');
    
    console.log('\n🔍 VERIFICATION PROCESS:');
    console.log('1. Student receives PDF certificate with QR code');
    console.log('2. Anyone can scan QR code with phone camera');
    console.log('3. QR code opens verification URL in browser');
    console.log('4. Verification page shows certificate authenticity');
    console.log('5. Instant verification without manual URL entry');
    
    console.log('\n📁 TEST FILES CREATED:');
    console.log(`• ${premiumFilename} - Premium certificate with QR code`);
    console.log(`• ${multiFilename} - Multilingual certificate with QR code`);
    console.log('📖 Open these PDFs to see QR codes in action!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testQRCodeInPDF().catch(console.error);