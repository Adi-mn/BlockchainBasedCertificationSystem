const MultilingualCertificateGenerator = require('../utils/multilingualCertificate');
const fs = require('fs');

const testHindiUnicode = async () => {
  try {
    console.log('🎨 TESTING HINDI WITH UNICODE FONTS');
    console.log('='.repeat(50));

    const generator = new MultilingualCertificateGenerator();
    
    // Test Hindi with Unicode fonts
    console.log('🔤 Testing Hindi Native Script with Unicode Fonts:');
    
    const certificateData = {
      studentName: 'uhijo',
      courseName: 'jkl',
      instituteName: 'ABC University',
      certificateId: 'UNICODE-HINDI-TEST',
      grade: '',
      description: '',
      issuedDate: new Date().toISOString(),
      language: 'hindi'
    };
    
    // Test translation first
    const title = generator.getTranslation('hindi', 'certificateOfCompletion');
    console.log(`Original Hindi Text: "${title}"`);
    
    // Check if font file exists
    const fontPath = require('path').join(__dirname, '..', 'fonts', 'NotoSansDevanagari-Regular.ttf');
    const fontExists = fs.existsSync(fontPath);
    console.log(`Unicode font exists: ${fontExists ? 'YES ✅' : 'NO ❌'}`);
    console.log(`Font path: ${fontPath}`);
    
    // Generate preview
    console.log('\n📄 Generating preview with Unicode fonts...');
    const preview = await generator.generatePreview(certificateData);
    
    console.log(`✅ Preview generated (${preview.length} chars)`);
    
    // Save preview
    const base64Data = preview.replace(/^data:application\/pdf;base64,/, '');
    fs.writeFileSync('unicode-hindi-test.pdf', base64Data, 'base64');
    console.log('📁 Saved as: unicode-hindi-test.pdf');
    
    console.log('\n🎯 EXPECTED WITH UNICODE FONTS:');
    console.log('   ✅ Title: "पूर्णता प्रमाणपत्र" (proper Devanagari)');
    console.log('   ✅ Subtitle: "यह प्रमाणित करता है कि" (proper Devanagari)');
    console.log('   ❌ NOT: "©B"&M\'9$"&*"Ü0\'é>\'9*\'IM"& (garbled text)');
    console.log('   ✅ Clean, readable Hindi script throughout');
    
  } catch (error) {
    console.error('❌ Unicode Hindi test failed:', error);
  }
};

testHindiUnicode();