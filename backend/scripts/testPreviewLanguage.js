const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:5000/api';

const testPreviewLanguage = async () => {
  try {
    console.log('🌍 TESTING PREVIEW LANGUAGE GENERATION');
    console.log('=' .repeat(50));

    // Login as institution
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'institution@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Institution login successful');

    // Test Hindi preview
    console.log('\n📋 Testing Hindi Preview Generation');
    const hindiPreviewRes = await axios.post(`${API_BASE}/multilingual-certificates/preview`, {
      studentName: 'राज कुमार टेस्ट',
      courseName: 'हिंदी भाषा कोर्स',
      certificateId: 'HINDI-PREVIEW-TEST',
      grade: 'A+',
      description: 'हिंदी प्रीव्यू परीक्षण',
      issuedDate: new Date().toISOString(),
      language: 'hindi'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Hindi preview response received');
    console.log(`Language used: ${hindiPreviewRes.data.language_used}`);
    console.log(`Preview image size: ${hindiPreviewRes.data.preview_image ? hindiPreviewRes.data.preview_image.length : 0} chars`);

    // Save preview as file to check content
    if (hindiPreviewRes.data.preview_image) {
      const base64Data = hindiPreviewRes.data.preview_image.replace(/^data:application\/pdf;base64,/, '');
      fs.writeFileSync('hindi-preview-test.pdf', base64Data, 'base64');
      console.log('📁 Hindi preview saved as: hindi-preview-test.pdf');
    }

    // Test Tamil preview
    console.log('\n🇮🇳 Testing Tamil Preview Generation');
    const tamilPreviewRes = await axios.post(`${API_BASE}/multilingual-certificates/preview`, {
      studentName: 'தமிழ் மாணவர்',
      courseName: 'தமிழ் மொழி பாடநெறி',
      certificateId: 'TAMIL-PREVIEW-TEST',
      grade: 'A',
      language: 'tamil'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Tamil preview response received');
    console.log(`Language used: ${tamilPreviewRes.data.language_used}`);

    // Save Tamil preview
    if (tamilPreviewRes.data.preview_image) {
      const base64Data = tamilPreviewRes.data.preview_image.replace(/^data:application\/pdf;base64,/, '');
      fs.writeFileSync('tamil-preview-test.pdf', base64Data, 'base64');
      console.log('📁 Tamil preview saved as: tamil-preview-test.pdf');
    }

    // Test English for comparison
    console.log('\n🇺🇸 Testing English Preview Generation');
    const englishPreviewRes = await axios.post(`${API_BASE}/multilingual-certificates/preview`, {
      studentName: 'English Test Student',
      courseName: 'English Language Course',
      certificateId: 'ENGLISH-PREVIEW-TEST',
      grade: 'A+',
      language: 'english'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ English preview response received');
    console.log(`Language used: ${englishPreviewRes.data.language_used}`);

    // Save English preview
    if (englishPreviewRes.data.preview_image) {
      const base64Data = englishPreviewRes.data.preview_image.replace(/^data:application\/pdf;base64,/, '');
      fs.writeFileSync('english-preview-test.pdf', base64Data, 'base64');
      console.log('📁 English preview saved as: english-preview-test.pdf');
    }

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 PREVIEW LANGUAGE TEST COMPLETED!');
    console.log('\n📁 Check the generated PDF files to verify language content:');
    console.log('   - hindi-preview-test.pdf');
    console.log('   - tamil-preview-test.pdf');
    console.log('   - english-preview-test.pdf');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testPreviewLanguage();