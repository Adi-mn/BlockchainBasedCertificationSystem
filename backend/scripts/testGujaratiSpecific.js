const axios = require('axios');
const fs = require('fs');

const testGujaratiSpecific = async () => {
  try {
    console.log('🔍 TESTING GUJARATI SPECIFIC ISSUE');
    console.log('='.repeat(50));

    // Login as institution
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'institution@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Institution login successful');

    // Test Gujarati with exact same data as in your form
    console.log('\n🔤 Testing GUJARATI with your form data:');
    
    const requestData = {
      studentName: 'uhijo',
      studentEmail: 'test@example.com',
      courseName: 'jkl',
      certificateType: 'Course Completion',
      grade: '',
      description: '',
      language: 'gujarati',
      certificateId: `GUJARATI-TEST-${Date.now()}`,
      issuedDate: new Date().toISOString()
    };
    
    console.log('📤 Request data:', requestData);
    
    const response = await axios.post('http://localhost:5000/api/multilingual-certificates/preview', requestData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📥 Response received:');
    console.log(`   ✅ Success: ${response.data.success}`);
    console.log(`   📋 Language used: ${response.data.language_used}`);
    console.log(`   📄 Preview length: ${response.data.preview_image.length} chars`);
    
    // Save the preview for inspection
    if (response.data.preview_image) {
      const base64Data = response.data.preview_image.replace(/^data:application\/pdf;base64,/, '');
      fs.writeFileSync('gujarati-test-preview.pdf', base64Data, 'base64');
      console.log('📁 Preview saved as: gujarati-test-preview.pdf');
    }
    
    console.log('\n🎯 EXPECTED RESULT:');
    console.log('   ✅ Title should show: "Purnata Pramanpatra (Certificate of Completion)"');
    console.log('   ✅ Subtitle should show: "Aa Pramanit Kare Chhe Ke (This is to certify that)"');
    console.log('   ❌ Should NOT show: "*Ã«&Í*"«&*"Ü*é%*"*Í£«&" (garbled text)');
    console.log('   ✅ All text should be readable transliteration');
    
  } catch (error) {
    console.error('❌ Gujarati test failed:', error.response?.data || error.message);
  }
};

testGujaratiSpecific();