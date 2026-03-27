const MultilingualCertificateGenerator = require('../utils/multilingualCertificate');
const fs = require('fs');

const testNativeScripts = async () => {
  try {
    console.log('🌍 TESTING NATIVE SCRIPTS FOR ALL LANGUAGES');
    console.log('='.repeat(60));

    const generator = new MultilingualCertificateGenerator();
    const languages = generator.getSupportedLanguages();
    
    console.log(`📋 Testing native script rendering for ${languages.length} languages...\n`);
    
    for (const lang of languages) {
      console.log(`🔤 Testing ${lang.name} (${lang.code}):`);
      
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
        console.log(`   Original: "${title}"`);
        
        // Generate preview with native script attempt
        const preview = await generator.generatePreview(certificateData);
        console.log(`   ✅ Preview generated (${preview.length} chars)`);
        
        // Save preview for inspection
        const base64Data = preview.replace(/^data:application\/pdf;base64,/, '');
        fs.writeFileSync(`native-${lang.code}-test.pdf`, base64Data, 'base64');
        console.log(`   📁 Saved: native-${lang.code}-test.pdf`);
        
        // Check if it's an Indian language
        const isIndian = ['hindi', 'tamil', 'telugu', 'malayalam', 'kannada', 'marathi', 'gujarati', 'bengali', 'punjabi', 'urdu'].includes(lang.code);
        if (isIndian) {
          console.log(`   🎨 Script: Native ${lang.code} script attempted`);
        } else {
          console.log(`   🎨 Script: Latin (English)`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('='.repeat(60));
    console.log('🎯 NATIVE SCRIPT TEST SUMMARY:');
    console.log('   📁 Check generated PDF files for each language');
    console.log('   🎨 Indian languages should attempt native scripts');
    console.log('   🔍 Compare rendering quality across languages');
    console.log('   ✅ Look for proper Unicode characters vs garbled text');
    
    console.log('\n📋 EXPECTED RESULTS:');
    console.log('   ✅ English: "Certificate of Completion" (Latin)');
    console.log('   🎨 Hindi/Marathi: "पूर्णता प्रमाणपत्र" (Devanagari)');
    console.log('   🎨 Tamil: "நிறைவு சான்றிதழ்" (Tamil script)');
    console.log('   🎨 Telugu: "పూర్తి చేసిన ప్రమాణపత్రం" (Telugu script)');
    console.log('   🎨 All others: Native scripts attempted');
    
  } catch (error) {
    console.error('❌ Native script test failed:', error);
  }
};

testNativeScripts();