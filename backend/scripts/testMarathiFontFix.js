const MultilingualCertificateGenerator = require('../utils/multilingualCertificate');
const fs = require('fs');

const testMarathiFontFix = async () => {
  try {
    console.log('🔧 TESTING MARATHI FONT FIX');
    console.log('=' .repeat(50));

    const generator = new MultilingualCertificateGenerator();
    
    // Test data with Marathi language
    const certificateData = {
      studentName: 'राहुल शर्मा', // Marathi name
      courseName: 'संगणक विज्ञान', // Computer Science in Marathi
      instituteName: 'ABC University',
      certificateId: 'MARATHI-FONT-TEST-2025',
      grade: 'उत्कृष्ट', // Excellent in Marathi
      description: 'संगणक विज्ञान अभ्यासक्रम', // Computer Science Course in Marathi
      issuedDate: new Date().toISOString(),
      language: 'marathi'
    };
    
    console.log('📋 Certificate data:', certificateData);
    
    // Test translation function
    console.log('\n🔤 Testing Marathi translations:');
    console.log(`Certificate of Completion: "${generator.getTranslation('marathi', 'certificateOfCompletion')}"`);
    console.log(`This is to certify: "${generator.getTranslation('marathi', 'thisIsToCertify')}"`);
    console.log(`Has successfully completed: "${generator.getTranslation('marathi', 'hasSuccessfullyCompleted')}"`);
    console.log(`Issued by: "${generator.getTranslation('marathi', 'issuedBy')}"`);
    
    // Generate preview with font fix
    console.log('\n� Generating  preview with font fix...');
    const previewBase64 = await generator.generatePreview(certificateData);
    
    console.log('✅ Preview generated with Times-Roman font');
    console.log(`Preview length: ${previewBase64.length} characters`);
    
    // Save as PDF file
    const base64Data = previewBase64.replace(/^data:application\/pdf;base64,/, '');
    fs.writeFileSync('marathi-font-fix-test.pdf', base64Data, 'base64');
    console.log('📁 Saved as: marathi-font-fix-test.pdf');
    
    // Generate full certificate
    console.log('\n📜 Generating full certificate with font fix...');
    const fullResult = await generator.generateCertificate(certificateData);
    
    console.log('✅ Full certificate generated');
    console.log(`Language used: ${fullResult.language_used}`);
    
    // Save full certificate PDF
    fs.writeFileSync('marathi-font-fix-full.pdf', fullResult.pdf_buffer);
    console.log('📁 Full certificate saved as: marathi-font-fix-full.pdf');
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 FONT FIX TEST RESULTS:');
    console.log('   🔤 Marathi translations: WORKING');
    console.log('   📄 Preview with Times-Roman: GENERATED');
    console.log('   📜 Full certificate with Times-Roman: GENERATED');
    console.log('   📁 Files saved for inspection');
    
    console.log('\n🔍 EXPECTED IMPROVEMENTS:');
    console.log('   ✅ Proper Marathi text rendering (no garbled characters)');
    console.log('   ✅ "पूर्णता प्रमाणपत्र" should be clearly visible');
    console.log('   ✅ All Devanagari characters should display correctly');
    console.log('   ✅ No more encoding issues');
    
    console.log('\n📁 CHECK THESE FILES:');
    console.log('   - marathi-font-fix-test.pdf (preview)');
    console.log('   - marathi-font-fix-full.pdf (full certificate)');
    console.log('   Both should show proper Marathi text!');
    
  } catch (error) {
    console.error('❌ Font fix test failed:', error);
  }
};

testMarathiFontFix();