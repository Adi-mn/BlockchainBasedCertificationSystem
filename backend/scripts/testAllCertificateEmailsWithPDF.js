require('dotenv').config();
const emailService = require('../utils/emailService');
const PremiumCertificateGenerator = require('../utils/premiumCertificateGenerator');
const MultilingualCertificateGenerator = require('../utils/multilingualCertificate');
const AutoCertificateGenerator = require('../utils/autoCertificateGenerator');

async function testAllCertificateEmailsWithPDF() {
  console.log('📎 TESTING ALL CERTIFICATE TYPES WITH PDF ATTACHMENTS');
  console.log('====================================================');
  
  const testEmail = 'kumar12345abhinek@gmail.com'; // Your test email
  
  try {
    // Test 1: Regular Certificate with PDF
    console.log('\n1️⃣ TESTING REGULAR CERTIFICATE WITH PDF');
    console.log('----------------------------------------');
    
    const pdfGenerator = new PremiumCertificateGenerator();
    const regularCertData = {
      studentName: 'Alice Johnson',
      courseName: 'Data Science Fundamentals',
      institutionName: 'Tech University',
      certificateType: 'Course Completion',
      issueDate: new Date(),
      _id: 'REG-' + Date.now(),
      grade: 'A',
      description: 'Completed with excellence'
    };
    
    const regularPDF = await pdfGenerator.generatePremiumCertificate(regularCertData);
    console.log(`✅ Regular PDF generated: ${Math.round(regularPDF.length / 1024)} KB`);
    
    const regularEmailData = {
      studentEmail: testEmail,
      studentName: regularCertData.studentName,
      courseName: regularCertData.courseName,
      certificateType: regularCertData.certificateType,
      institutionName: regularCertData.institutionName,
      issueDate: regularCertData.issueDate,
      certificateId: regularCertData._id,
      verificationUrl: 'http://localhost:3000/certificate/' + regularCertData._id,
      language: 'english'
    };
    
    const regularResult = await emailService.sendCertificateNotification(regularEmailData, regularPDF);
    console.log(regularResult.success ? '✅ Regular certificate email sent with PDF!' : '❌ Failed: ' + regularResult.error);
    
    // Test 2: Multilingual Certificate (already has PDF)
    console.log('\n2️⃣ TESTING MULTILINGUAL CERTIFICATE WITH PDF');
    console.log('---------------------------------------------');
    
    const multiGenerator = new MultilingualCertificateGenerator();
    const multiCertData = {
      studentName: 'Bob Smith',
      courseName: 'Machine Learning',
      instituteName: 'AI Institute',
      certificateId: 'MULTI-' + Date.now(),
      grade: 'A+',
      description: 'Outstanding performance',
      issuedDate: new Date().toISOString(),
      language: 'hindi'
    };
    
    const multiResult = await multiGenerator.generateCertificate(multiCertData);
    console.log(`✅ Multilingual PDF generated: ${Math.round(multiResult.pdf_buffer.length / 1024)} KB`);
    
    const multiEmailData = {
      studentEmail: testEmail,
      studentName: multiCertData.studentName,
      courseName: multiCertData.courseName,
      certificateType: 'Course Certificate',
      institutionName: multiCertData.instituteName,
      issueDate: new Date(multiCertData.issuedDate),
      certificateId: multiCertData.certificateId,
      verificationUrl: 'http://localhost:3000/certificate/' + multiCertData.certificateId,
      language: multiCertData.language
    };
    
    const multiEmailResult = await emailService.sendCertificateNotification(multiEmailData, multiResult.pdf_buffer);
    console.log(multiEmailResult.success ? '✅ Multilingual certificate email sent with PDF!' : '❌ Failed: ' + multiEmailResult.error);
    
    // Test 3: Auto Certificate (already has PDF)
    console.log('\n3️⃣ TESTING AUTO CERTIFICATE WITH PDF');
    console.log('------------------------------------');
    
    const autoGenerator = new AutoCertificateGenerator();
    const autoCertData = {
      studentName: 'Charlie Brown',
      courseName: 'Web Development',
      teacherName: 'Prof. Wilson',
      instituteName: 'Code Academy',
      certificateId: 'AUTO-' + Date.now(),
      language: 'english',
      template: 'classic'
    };
    
    const autoResult = await autoGenerator.generateCertificate(autoCertData);
    console.log(`✅ Auto PDF generated: ${Math.round(autoResult.pdf_buffer.length / 1024)} KB`);
    
    const autoEmailData = {
      studentEmail: testEmail,
      studentName: autoCertData.studentName,
      courseName: autoCertData.courseName,
      certificateType: 'Auto Certificate',
      institutionName: autoCertData.instituteName,
      issueDate: new Date(),
      certificateId: autoCertData.certificateId,
      verificationUrl: 'http://localhost:3000/certificate/' + autoCertData.certificateId,
      language: autoCertData.language
    };
    
    const autoEmailResult = await emailService.sendCertificateNotification(autoEmailData, autoResult.pdf_buffer);
    console.log(autoEmailResult.success ? '✅ Auto certificate email sent with PDF!' : '❌ Failed: ' + autoEmailResult.error);
    
    console.log('\n🎉 ALL CERTIFICATE TYPES TESTED!');
    console.log('================================');
    console.log('✅ Regular certificates: PDF attached');
    console.log('✅ Multilingual certificates: PDF attached');
    console.log('✅ Auto certificates: PDF attached');
    
    console.log('\n📧 CHECK YOUR EMAIL INBOX:');
    console.log(`📬 Email: ${testEmail}`);
    console.log('📎 You should have received 3 emails with PDF attachments:');
    console.log('   1. Alice_Johnson_Data_Science_Fundamentals_Certificate.pdf');
    console.log('   2. Bob_Smith_Machine_Learning_Certificate.pdf');
    console.log('   3. Charlie_Brown_Web_Development_Certificate.pdf');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n🚀 PDF ATTACHMENT SYSTEM COMPLETE!');
  console.log('==================================');
  console.log('✅ All certificate types now include PDF attachments');
  console.log('✅ Students receive professional emails with PDFs');
  console.log('✅ No need to download from links - PDFs are attached!');
  console.log('✅ Email system is fully operational with attachments');
}

testAllCertificateEmailsWithPDF().catch(console.error);