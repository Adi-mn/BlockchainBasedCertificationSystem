const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const testLoginReliability = async () => {
  try {
    console.log('🔐 TESTING LOGIN RELIABILITY');
    console.log('=' .repeat(50));

    const testAccounts = [
      { email: 'institution@demo.com', password: 'password123', role: 'Institution' },
      { email: 'admin@demo.com', password: 'password123', role: 'Admin' },
      { email: 'student1@demo.com', password: 'password123', role: 'Student' },
      { email: 'verifier@demo.com', password: 'password123', role: 'Verifier' }
    ];

    // Test each account multiple times
    for (const account of testAccounts) {
      console.log(`\n👤 Testing ${account.role}: ${account.email}`);
      
      let successCount = 0;
      let failCount = 0;
      
      // Test login 5 times
      for (let i = 1; i <= 5; i++) {
        try {
          const loginRes = await axios.post(`${API_BASE}/auth/login`, {
            email: account.email,
            password: account.password
          });
          
          if (loginRes.data.success && loginRes.data.token) {
            successCount++;
            console.log(`   ✅ Attempt ${i}: SUCCESS`);
          } else {
            failCount++;
            console.log(`   ❌ Attempt ${i}: FAILED (no token)`);
          }
        } catch (error) {
          failCount++;
          console.log(`   ❌ Attempt ${i}: FAILED (${error.response?.status || 'network error'})`);
        }
        
        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`   📊 Results: ${successCount}/5 successful, ${failCount}/5 failed`);
      
      if (successCount === 5) {
        console.log(`   🎉 ${account.role} login: RELIABLE`);
      } else if (successCount >= 3) {
        console.log(`   ⚠️  ${account.role} login: MOSTLY RELIABLE`);
      } else {
        console.log(`   ❌ ${account.role} login: UNRELIABLE`);
      }
    }

    // Test with wrong password
    console.log('\n🚫 Testing Wrong Password Handling');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'institution@demo.com',
        password: 'wrongpassword'
      });
      console.log('❌ Wrong password test failed - should have been rejected');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Wrong password correctly rejected');
      } else {
        console.log(`❌ Unexpected error: ${error.response?.status}`);
      }
    }

    // Test with non-existent user
    console.log('\n👻 Testing Non-Existent User');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'nonexistent@test.com',
        password: 'password123'
      });
      console.log('❌ Non-existent user test failed - should have been rejected');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Non-existent user correctly rejected');
      } else {
        console.log(`❌ Unexpected error: ${error.response?.status}`);
      }
    }

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 LOGIN RELIABILITY TEST COMPLETED!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testLoginReliability();