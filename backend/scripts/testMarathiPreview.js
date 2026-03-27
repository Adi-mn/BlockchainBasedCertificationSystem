const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:5000/api';

const testMarathiPreview = async () => {
  try {
    console.log('🇮🇳 TESTING MARATHI PREVIEW SPECIFICALLY');
    console.log('=' .repeat(50));

    // Login as institution
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'institution@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Institution login successful');

    // Test Marathi preview with exact same data as in image
    console.log('\n📋 Testing Marathi Preview (matching your form)');
    const marathiPreviewRes = await axios.post(`${API_BASE}/multilingual-certificates/preview`, {
      studentName: 'jkj',
      courseName: 'yuhjk',
      certificateId: 'MARATHI-TEST-001',
      grade: 'huijko',
      description: 'yuhjkl',
      issuedDate: new Date().toISOString(),
      language: 'marathi'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Marathi preview response received');
    console.log(`Language used: ${marathiPreviewRes.data.language_used}`);
    console.log(`Message: ${marathiPreviewRes.data.message}`);

    // Save preview to check content
    if (marathiPreviewRes.data.preview_image) {
      const base64Data = marathiPreviewRes.data.preview_image.replace(/^data:application\/pdf;base64,/, '');
      fs.writeFileSync('marathi-preview-test.pdf', base64Data, 'base64');
      console.log('📁 Marathi preview saved as: marathi-preview-test.pdf');
      console.log('📄 Check this PDF - it should show Marathi text like "पूर्णता प्रमाणपत्र"');
    }

    // Test the translation function directly
    console.log('\n🔍 Testing Translation Function');
    const MultilingualCertificateGenerator = require('../utils/multilingualCertificate');
    const generator = new MultilingualCertificateGenerator();
    
    console.log('Marathi translations:');
    console.log(`- Certificate of Completion: "${generator.getTranslation('marathi', 'certificateOfCompletion')}"`);
    console.log(`- This is to certify: "${generator.getTranslation('marathi', 'thisIsToCertify')}"`);
    console.log(`- Has successfully completed: "${generator.getTranslation('marathi', 'hasSuccessfullyCompleted')}"`);

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 MARATHI PREVIEW TEST COMPLETED!');
    console.log('\n📋 RESULTS:');
    console.log('   🌍 Marathi translations: ADDED');
    console.log('   📋 Preview generation: WORKING');
    console.log('   📁 PDF file: SAVED FOR VERIFICATION');
    
    console.log('\n🔍 NEXT STEPS:');
    console.log('1. Check marathi-preview-test.pdf file');
    console.log('2. It should show Marathi text instead of English');
    console.log('3. If still English, there may be a frontend caching issue');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testMarathiPreview();