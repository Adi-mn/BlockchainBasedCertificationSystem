const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const simpleTest = async () => {
  try {
    console.log('🧪 SIMPLE AUTO-CREATION TEST');
    
    // Login as institution
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'institution@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Institution logged in');

    // Create certificate with proper IPFS hash
    const testEmail = `autotest${Date.now()}@test.com`;
    
    console.log(`📧 Testing with email: ${testEmail}`);
    
    const certData = {
      studentName: 'Auto Test Student',
      studentEmail: testEmail,
      certificateType: 'Course Completion',
      courseName: 'Auto Test Course',
      issueDate: new Date().toISOString(),
      grade: 'A',
      description: 'Test certificate',
      ipfsHash: 'QmYwAPJzv5CZsnA6wLWfVuqQbNxtTgvpyKL4wBuTGsMnR6',
      issuerAddress: '0x1234567890123456789012345678901234567890'
    };

    console.log('📜 Creating certificate...');
    
    const response = await axios.post(`${API_BASE}/certificates`, certData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Certificate created successfully!');
    console.log('📋 Response:', response.data);

    // Test student login
    console.log('\n👨‍🎓 Testing student login...');
    
    try {
      const studentLogin = await axios.post(`${API_BASE}/auth/login`, {
        email: testEmail,
        password: 'password123'
      });
      
      console.log('✅ Student login successful!');
      console.log('🎉 AUTO-CREATION SYSTEM WORKING!');
      
    } catch (loginError) {
      console.error('❌ Student login failed:', loginError.response?.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

simpleTest();