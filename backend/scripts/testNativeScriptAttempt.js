const MultilingualCertificateGenerator = require('../utils/multilingualCertificate');
const fs = require('fs');

const testNativeScriptAttempt = async () => {
  try {
    console.log('🎨 TESTING NATIVE SCRIPT RENDERING ATTEMPT');
    console.log('='.repeat(60));

    const generator = new MultilingualCertificateGenerator();
    
    // Test Gujarati specifically
    console.log('🔤 Testing Gujarati Native Script:');
    
    const certificateData = {
      studentName: 'uhijo',
      courseName: 'jkl',
      instituteName: 'ABC University',
      certificateId: 'NATIVE-GUJARATI-TEST',
      grade: '',
      description: '',
      issuedDate: new Date().toISOString(),
      language: 'gujarati'
    };
    
    // Test translation first
    const title = generator.getTranslation('gujarati', 'certificateOfCompletion');
    console.log(`Original Gujarati Text: "${title}"`);
    console.log(`Text Length: ${title.length} characters`);
    console.log(`Unicode Points: ${Array.from(title).map(char => char.codePointAt(0).toString(16)).join(' ')}`);
    
    // Generate preview
    console.log('\n📄 Generating preview with native script attempt...');
    const preview = await generator.generatePreview(certificateData);
    
    console.log(`✅ Preview generated (${preview.length} chars)`);
    
    // Save preview
    const base64Data = preview.replace(/^data:application\\/pdf;base64,/, '');
    fs.writeFileSync('native-gujarati-attempt.pdf', base64Data, 'base64');
    console.log('📁 Saved as: native-gujarati-attempt.pdf');
    
    console.log('\\n🎯 ANALYSIS:');
    console.log('   📋 Check the console output above for font rendering messages');
    console.log('   📁 Open native-gujarati-attempt.pdf to see actual rendering');
    console.log('   🔍 Look for "Using NATIVE SCRIPT" vs "Using transliteration" messages');
    
    console.log('\\n📋 EXPECTED NATIVE GUJARATI TEXT:');
    console.log('   Title: "પૂર્ણતા પ્રમાણપત્ર" (Gujarati script)');
    console.log('   Subtitle: "આ પ્રમાણિત કરે છે કે" (Gujarati script)');
    console.log('   NOT: "Purnata Pramanpatra" (transliteration)');
    
  } catch (error) {
    console.error('❌ Native script test failed:', error);
  }
};

testNativeScriptAttempt();