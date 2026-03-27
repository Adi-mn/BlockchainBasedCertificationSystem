const MultilingualCertificateGenerator = require('../utils/multilingualCertificate');
const fs = require('fs');

const testAllLanguages = async () => {
  try {
    console.log('🌍 TESTING ALL LANGUAGES WITH IMPROVED FONTS');
    console.log('='.repeat(60));

    const generator = new MultilingualCertificateGenerator();
    const languages = generator.getSupportedLanguages();
    
    console.log(`📋 Testing ${languages.length} languages...`);
    
    for (const lang of languages.slice(0, 5)) { // Test first 5 languages
      console.log(`\n🔤 Testing ${lang.name} (${lang.code}):`);
      
      const certificateData = {
        studentName: 'Test Student',
        courseName: 'Computer Science',
        instituteName: 'ABC University',
        certificateId: `TEST-${lang.code.toUpperCase()}-${Date.now()}`,
        grade: 'A+',
        description: 'Test course',
        issuedDate: new Date().toISOString(),
        language: lang.code
      };
      
      try {
        // Test translation
        const title = generator.getTranslation(lang.code, 'certificateOfCompletion');
        console.log(`   Title: "${title}"`);
        
        // Generate preview
        const preview = await generator.generatePreview(certificateData);
        console.log(`   ✅ Preview generated (${preview.length} chars)`);
        
        // Save preview for inspection
        const base64Data = preview.replace(/^data:application\/pdf;base64,/, '');
        fs.writeFileSync(`test-${lang.code}-preview.pdf`, base64Data, 'base64');
        console.log(`   📁 Saved: test-${lang.code}-preview.pdf`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 LANGUAGE TEST SUMMARY:');
    console.log('   📁 Check generated PDF files for each language');
    console.log('   ✅ Times-Roman/Times-Bold fonts should render Indian scripts better');
    console.log('   🔍 Compare with previous Helvetica-based versions');
    
  } catch (error) {
    console.error('❌ Language test failed:', error);
  }
};

testAllLanguages();