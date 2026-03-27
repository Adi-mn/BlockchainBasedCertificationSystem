const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:5000/api';

const testSpecialDownloads = async () => {
  try {
    // Login as institution
    console.log('🔐 Logging in as institution...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'institution@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Institution login successful');

    // Test 1: Download Hindi multilingual certificate
    console.log('\n🌍 Testing Hindi multilingual certificate download...');
    const hindiCertId = '693c750ea0de2bfd34aa14e4';
    
    try {
      const response = await axios.get(
        `${API_BASE}/certificates/${hindiCertId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'arraybuffer'
        }
      );

      console.log('✅ Hindi certificate download successful');
      console.log(`Content-Length: ${response.data.length} bytes`);

      fs.writeFileSync('test-hindi-certificate.pdf', response.data);
      console.log('📁 Saved as: test-hindi-certificate.pdf');

    } catch (error) {
      console.error('❌ Hindi certificate download failed:', error.response?.status);
      if (error.response?.data) {
        console.error('Error:', Buffer.from(error.response.data).toString());
      }
    }

    // Test 2: Download auto-generated certificate
    console.log('\n🤖 Testing auto-generated certificate download...');
    const autoCertId = '693c750ea0de2bfd34aa14e5';
    
    try {
      const response = await axios.get(
        `${API_BASE}/certificates/${autoCertId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'arraybuffer'
        }
      );

      console.log('✅ Auto-generated certificate download successful');
      console.log(`Content-Length: ${response.data.length} bytes`);

      fs.writeFileSync('test-auto-certificate.pdf', response.data);
      console.log('📁 Saved as: test-auto-certificate.pdf');

    } catch (error) {
      console.error('❌ Auto-generated certificate download failed:', error.response?.status);
      if (error.response?.data) {
        console.error('Error:', Buffer.from(error.response.data).toString());
      }
    }

    console.log('\n🎉 Special download tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testSpecialDownloads();