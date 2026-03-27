const MultilingualCertificateGenerator = require('../utils/multilingualCertificate');

async function testMultilingualIssue() {
  console.log('🔍 Testing Multilingual Certificate Issue...\n');
  
  const generator = new MultilingualCertificateGenerator();
  
  // Test data
  const testData = {
    studentName: 'राहुल शर्मा', // Hindi name
    courseName: 'कंप्यूटर साइंस', // Hindi course
    instituteName: 'भारतीय प्रौद्योगिकी संस्थान', // Hindi institute
    certificateId: 'TEST-HINDI-001',
    grade: 'A+',
    description: 'उत्कृष्ट प्रदर्शन', // Hindi description
    issuedDate: new Date().toISOString(),
    language: 'hindi'
  };
  
  console.log('📋 Test Data:');
  console.log('Language:', testData.language);
  console.log('Student Name:', testData.studentName);
  console.log('Course Name:', testData.courseName);
  console.log('Institute Name:', testData.instituteName);
  console.log();
  
  try {
    // Test translation function
    console.log('🔤 Testing Translations:');
    const titleTranslation = generator.getTranslation('hindi', 'certificateOfCompletion');
    console.log('Title in Hindi:', titleTranslation);
    
    const certifyTranslation = generator.getTranslation('hindi', 'thisIsToCertify');
    console.log('Certify text in Hindi:', certifyTranslation);
    console.log();
    
    // Test preview generation
    console.log('🖼️ Generating Preview...');
    const preview = await generator.generatePreview(testData);
    console.log('Preview generated:', preview ? 'SUCCESS' : 'FAILED');
    console.log('Preview length:', preview ? preview.length : 0);
    console.log();
    
    // Test PDF generation
    console.log('📄 Generating PDF...');
    const pdfBuffer = await generator.generatePDF(testData);
    console.log('PDF generated:', pdfBuffer ? 'SUCCESS' : 'FAILED');
    console.log('PDF size:', pdfBuffer ? pdfBuffer.length : 0, 'bytes');
    console.log();
    
    // Test with English for comparison
    console.log('🔄 Testing English for comparison...');
    const englishData = { ...testData, language: 'english' };
    const englishPreview = await generator.generatePreview(englishData);
    console.log('English preview generated:', englishPreview ? 'SUCCESS' : 'FAILED');
    console.log();
    
    // Test Tamil
    console.log('🔄 Testing Tamil...');
    const tamilData = { 
      ...testData, 
      language: 'tamil',
      studentName: 'ராஜேஷ் குமார்',
      courseName: 'கணினி அறிவியல்'
    };
    const tamilPreview = await generator.generatePreview(tamilData);
    console.log('Tamil preview generated:', tamilPreview ? 'SUCCESS' : 'FAILED');
    console.log();
    
    console.log('✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testMultilingualIssue();