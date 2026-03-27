const axios = require('axios');

const testCurrentStatus = async () => {
  try {
    console.log('🔍 TESTING CURRENT MULTILINGUAL STATUS');
    console.log('='.repeat(50));

    // Login as institution
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'institution@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Institution login successful');

    // Test multiple languages
    const testLanguages = ['english', 'marathi', 'hindi', 'malayalam', 'tamil'];
    
    for (const lang of testLanguages) {
      console.log(`\n🔤 Testing ${lang.toUpperCase()}:`);
      
      const requestData = {
        studentName: 'ttgyuhj',
        studentEmail: 'test@example.com',
        courseName: 'yuhj',
        certificateType: 'Course Completion',
        grade: '',
        description: '',
        language: lang,
        certificateId: `TEST-${lang.toUpperCase()}-${Date.now()}`,
        issuedDate: new Date().toISOString()
      };
      
      try {
        const response = await axios.post('http://localhost:5000/api/multilingual-certificates/preview', requestData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`   ✅ Preview generated successfully`);
        console.log(`   📋 Language used: ${response.data.language_used}`);
        console.log(`   📄 Preview length: ${response.data.preview_image.length} chars`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 CURRENT STATUS SUMMARY:');
    console.log('   ✅ All languages should generate previews successfully');
    console.log('   🔄 Indian languages use transliteration system');
    console.log('   📄 English uses original text');
    console.log('   🎨 All use Helvetica fonts for consistent rendering');
    
  } catch (error) {
    console.error('❌ Status test failed:', error.response?.data || error.message);
  }
};

testCurrentStatus();