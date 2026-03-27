const MultilingualCertificateGenerator = require('../utils/multilingualCertificate');
const fs = require('fs');

const testNativeScriptRendering = async () => {
  try {
    console.log('🎨 TESTING NATIVE SCRIPT RENDERING');
    console.log('='.repeat(60));

    const generator = new MultilingualCertificateGenerator();
    
    // Test key Indian languages with native scripts
    const testLanguages = [
      { code: 'hindi', name: 'Hindi', script: 'Devanagari' },
      { code: 'marathi', name: 'Marathi', script: 'Devanagari' },
      { code: 'gujarati', name: 'Gujarati', script: 'Gujarati' },
      { code: 'tamil', name: 'Tamil', script: 'Tamil' },
      { code: 'bengali', name: 'Bengali', script: 'Bengali' }
    ];
    
    for (const lang of testLanguages) {
      console.log(`\n🔤 Testing ${lang.name} (${lang.script} Script):`);
      
      const certificateData = {
        studentName: 'Test Student',
        courseName: 'Computer Science',
        instituteName: 'ABC University',
        certificateId: `NATIVE-${lang.code.toUpperCase()}-${Date.now()}`,
        grade: 'A+',
        description: 'Test course',
        issuedDate: new Date().toISOString(),
        language: lang.code
      };
      
      try {
        // Test translation
        const title = generator.getTranslation(lang.code, 'certificateOfCompletion');
        console.log(`   Original Text: "${title}"`);
        
        // Generate preview with native script
        const preview = await generator.generatePreview(certificateData);
        console.log(`   ✅ Preview generated (${preview.length} chars)`);
        
        // Save preview for inspection
        const base64Data = preview.replace(/^data:application\/pdf;base64,/, '');
        fs.writeFileSync(`native-${lang.code}-preview.pdf`, base64Data, 'base64');
        console.log(`   📁 Saved: native-${lang.code}-preview.pdf`);
        console.log(`   🎨 Script: ${lang.script} (Native)`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 NATIVE SCRIPT TEST RESULTS:');
    console.log('   📁 Check generated PDF files for native script rendering');
    console.log('   🎨 All Indian languages should show native scripts');
    console.log('   ✅ Hindi/Marathi: देवनागरी script');
    console.log('   ✅ Gujarati: ગુજરાતી script');
    console.log('   ✅ Tamil: தமிழ் script');
    console.log('   ✅ Bengali: বাংলা script');
    
    console.log('\n📋 EXPECTED IN CERTIFICATES:');
    console.log('   Hindi: "पूर्णता प्रमाणपत्र" (Devanagari)');
    console.log('   Gujarati: "પૂર્ણતા પ્રમાણપત્ર" (Gujarati script)');
    console.log('   Tamil: "நிறைவு சான்றிதழ்" (Tamil script)');
    console.log('   Bengali: "সমাপনী সার্টিফিকেট" (Bengali script)');
    
  } catch (error) {
    console.error('❌ Native script test failed:', error);
  }
};

testNativeScriptRendering();