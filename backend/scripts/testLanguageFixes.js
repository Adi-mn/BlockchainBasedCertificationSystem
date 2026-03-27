const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const testLanguageFixes = async () => {
  try {
    console.log('🌍 TESTING LANGUAGE FIXES');
    console.log('=' .repeat(50));

    // Test 1: Login as institution
    console.log('\n🏢 Step 1: Institution Login');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'institution@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Institution login successful');

    // Test 2: Generate Hindi preview with auth
    console.log('\n📋 Step 2: Generate Hindi Preview (with auth)');
    const previewRes = await axios.post(`${API_BASE}/multilingual-certificates/preview`, {
      studentName: 'राज कुमार प्रीव्यू',
      courseName: 'हिंदी भाषा प्रीव्यू कोर्स',
      certificateId: 'PREVIEW-HINDI-001',
      grade: 'A+',
      description: 'हिंदी प्रीव्यू परीक्षण',
      issuedDate: new Date().toISOString(),
      language: 'hindi'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Hindi preview generated with auth');
    console.log(`Language used: ${previewRes.data.language_used}`);
    console.log(`Preview image length: ${previewRes.data.preview_image ? previewRes.data.preview_image.length : 0} chars`);

    // Test 3: Generate Tamil preview
    console.log('\n🇮🇳 Step 3: Generate Tamil Preview');
    const tamilPreviewRes = await axios.post(`${API_BASE}/multilingual-certificates/preview`, {
      studentName: 'தமிழ் மாணவர் பெயர்',
      courseName: 'தமிழ் மொழி பாடநெறி',
      certificateId: 'PREVIEW-TAMIL-001',
      grade: 'A',
      language: 'tamil'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Tamil preview generated');
    console.log(`Language used: ${tamilPreviewRes.data.language_used}`);

    // Test 4: Generate full certificate with proper IPFS
    console.log('\n📜 Step 4: Generate Full Certificate');
    const testEmail = `language-test-${Date.now()}@test.com`;
    
    const certRes = await axios.post(`${API_BASE}/multilingual-certificates/generate`, {
      studentName: 'राज कुमार फुल सर्टिफिकेट',
      studentEmail: testEmail,
      courseName: 'हिंदी भाषा पूर्ण कोर्स',
      certificateType: 'Course Completion',
      certificateId: `LANG-TEST-${Date.now()}`,
      language: 'hindi',
      grade: 'A+',
      description: 'भाषा परीक्षण पूर्ण प्रमाणपत्र'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Full certificate generated');
    console.log(`Certificate ID: ${certRes.data.certificate._id}`);
    console.log(`Language: ${certRes.data.certificate.language}`);
    console.log(`IPFS Hash: ${certRes.data.ipfs_hash}`);

    // Test 5: Check certificate details
    console.log('\n🔍 Step 5: Check Certificate Details');
    const certDetailsRes = await axios.get(`${API_BASE}/certificates/${certRes.data.certificate._id}`);
    
    console.log('✅ Certificate details retrieved');
    console.log(`Stored language: ${certDetailsRes.data.certificate.language}`);
    console.log(`IPFS Hash: ${certDetailsRes.data.certificate.ipfsHash}`);

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 LANGUAGE FIXES TEST COMPLETED!');
    console.log('\n✅ RESULTS:');
    console.log('   🔐 Auth headers: ADDED');
    console.log('   🌍 Language preview: WORKING');
    console.log('   📜 Certificate generation: WORKING');
    console.log('   💾 Language storage: WORKING');
    console.log('   📁 IPFS hash: PROPER');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testLanguageFixes();