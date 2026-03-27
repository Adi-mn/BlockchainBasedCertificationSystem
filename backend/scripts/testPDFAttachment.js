require('dotenv').config();
const emailService = require('../utils/emailService');
const PremiumCertificateGenerator = require('../utils/premiumCertificateGenerator');

async function testPDFAttachment() {
  console.log('📎 TESTING PDF ATTACHMENT IN EMAILS');
  console.log('===================================');
  
  try {
    // Generate a test PDF certificate
    console.log('📄 Generating test PDF certificate...');
    const pdfGenerator = new PremiumCertificateGenerator();
    
    const certificateData = {
      studentName: 'John Doe',
      courseName: 'Advanced Web Development',
      institutionName: 'ABC University',
      certificateType: 'Course Completion',
      issueDate: new Date(),
      _id: 'TEST-PDF-' + Date.now(),
      grade: 'A+',
      description: 'Successfully completed the Advanced Web Development course with distinction.'
    };
    
    const pdfBuffer = await pdfGenerator.generatePremiumCertificate(certificateData);
    console.log('✅ PDF generated successfully');
    console.log(`📊 PDF size: ${Math.round(pdfBuffer.length / 1024)} KB`);
    
    // Test email with PDF attachment
    console.log('\n📧 Testing email with PDF attachment...');
    
    const emailData = {
      studentEmail: 'kumar12345abhinek@gmail.com', // Your test email
      studentName: certificateData.studentName,
      courseName: certificateData.courseName,
      certificateType: certificateData.certificateType,
      institutionName: certificateData.institutionName,
      issueDate: certificateData.issueDate,
      certificateId: certificateData._id,
      verificationUrl: 'http://localhost:3000/certificate/' + certificateData._id,
      language: 'english'
    };
    
    // Send email with PDF attachment
    const emailResult = await emailService.sendCertificateNotification(emailData, pdfBuffer);
    
    if (emailResult.success) {
      console.log('✅ SUCCESS! Email with PDF attachment sent!');
      console.log(`📧 Message ID: ${emailResult.messageId}`);
      console.log(`👤 Sent to: ${emailResult.recipient}`);
      console.log(`📎 PDF attached: ${certificateData.studentName.replace(/\s+/g, '_')}_${certificateData.courseName.replace(/\s+/g, '_')}_Certificate.pdf`);
      
      console.log('\n🎉 PDF ATTACHMENT WORKING!');
      console.log('📧 Check your email for the certificate PDF attachment');
      console.log('📎 The PDF should be attached to the email');
      
    } else {
      console.log('❌ Email with PDF attachment failed:', emailResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n📋 WHAT TO EXPECT:');
  console.log('✅ Email with professional HTML content');
  console.log('✅ PDF certificate attached to email');
  console.log('✅ Filename: John_Doe_Advanced_Web_Development_Certificate.pdf');
  console.log('✅ PDF contains certificate with student details');
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Check your email inbox');
  console.log('2. Look for PDF attachment');
  console.log('3. Download and verify PDF content');
  console.log('4. Generate real certificates - they will include PDF attachments!');
}

testPDFAttachment().catch(console.error);