const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const testMultilingualFix = async () => {
  try {
    console.log('🌍 TESTING MULTILINGUAL CERTIFICATE FIX');
    console.log('=' .repeat(50));

    // Test 1: Login as institution
    console.log('\n🏢 Step 1: Institution Login');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'institution@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Institution login successful');

    // Test 2: Get supported languages
    console.log('\n🌐 Step 2: Check Supported Languages');
    const langRes = await axios.get(`${API_BASE}/multilingual-certificates/languages`);
    console.log(`✅ Found ${langRes.data.languages.length} supported languages`);
    langRes.data.languages.forEach(lang => {
      console.log(`   - ${lang.name} (${lang.code})`);
    });

    // Test 3: Generate preview in Hindi
    console.log('\n📋 Step 3: Generate Hindi Preview');
    const previewRes = await axios.post(`${API_BASE}/multilingual-certificates/preview`, {
      studentName: 'राज कुमार टेस्ट',
      courseName: 'हिंदी भाषा कोर्स',
      certificateId: 'TEST-HINDI-001',
      grade: 'A+',
      description: 'हिंदी में प्रमाणपत्र परीक्षण',
      issuedDate: new Date().toISOString(),
      language: 'hindi'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Hindi preview generated successfully');
    console.log(`Language used: ${previewRes.data.language_used}`);

    // Test 4: Generate actual certificate
    console.log('\n📜 Step 4: Generate Full Hindi Certificate');
    const testEmail = `hindi-test-${Date.now()}@test.com`;
    
    const certRes = await axios.post(`${API_BASE}/multilingual-certificates/generate`, {
      studentName: 'राज कुमार फुल टेस्ट',
      studentEmail: testEmail,
      courseName: 'हिंदी भाषा पूर्ण कोर्स',
      certificateType: 'Course Completion',
      certificateId: `HINDI-FULL-${Date.now()}`,
      language: 'hindi',
      grade: 'A+',
      description: 'पूर्ण हिंदी प्रमाणपत्र परीक्षण'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Full Hindi certificate generated');
    console.log(`Certificate ID: ${certRes.data.certificate._id}`);
    console.log(`Student auto-created: ${testEmail}`);

    // Test 5: Student login with auto-created account
    console.log('\n👨‍🎓 Step 5: Test Auto-Created Student Login');
    const studentLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: testEmail,
      password: 'password123'
    });
    
    console.log('✅ Auto-created student login successful');

    // Test 6: Test Tamil certificate
    console.log('\n🇮🇳 Step 6: Generate Tamil Certificate');
    const tamilEmail = `tamil-test-${Date.now()}@test.com`;
    
    const tamilRes = await axios.post(`${API_BASE}/multilingual-certificates/generate`, {
      studentName: 'தமிழ் மாணவர்',
      studentEmail: tamilEmail,
      courseName: 'தமிழ் மொழி பாடநெறி',
      certificateType: 'Course Completion',
      certificateId: `TAMIL-${Date.now()}`,
      language: 'tamil',
      grade: 'A'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Tamil certificate generated');

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 ALL MULTILINGUAL TESTS PASSED!');
    console.log('\n✅ WORKING FEATURES:');
    console.log('   🌐 Language support: WORKING');
    console.log('   📋 Preview generation: WORKING');
    console.log('   📜 Certificate generation: WORKING');
    console.log('   👤 Auto-student creation: WORKING');
    console.log('   🔐 Student login: WORKING');
    console.log('   🇮🇳 Multiple languages: WORKING');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testMultilingualFix();