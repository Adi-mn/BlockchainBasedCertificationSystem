const axios = require('axios');

const testTransliterationAPI = async () => {
  try {
    console.log('🔧 TESTING TRANSLITERATION API');
    console.log('='.repeat(50));

    // Login as institution
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'institution@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Institution login successful');

    // Test Marathi preview with transliteration
    const requestData = {
      studentName: 'jk',
      studentEmail: 'test@example.com',
      courseName: 'njkl',
      certificateType: 'Course Completion',
      grade: '',
      description: '',
      language: 'marathi',
      certificateId: `TRANSLITERATION-TEST-${Date.now()}`,
      issuedDate: new Date().toISOString()
    };
    
    console.log('\\n📤 Testing Marathi preview with transliteration...');
    const marathiPreviewRes = await axios.post('http://localhost:5000/api/multilingual-certificates/preview', requestData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📥 Response received:');
    console.log(`   Language used: ${marathiPreviewRes.data.language_used}`);
    console.log(`   Success: ${marathiPreviewRes.data.success}`);
    console.log(`   Message: ${marathiPreviewRes.data.message}`);
    
    console.log('\\n🎯 EXPECTED RESULT:');
    console.log('   ✅ Preview should show transliterated text');
    console.log('   ✅ Title: "Purnata Pramanpatra (Certificate of Completion)"');
    console.log('   ✅ No more garbled characters like "©B"&M\'9$"');
    console.log('   ✅ All text should be readable in Latin script');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
};

testTransliterationAPI();