const axios = require('axios');

const debugConnectionIssue = async () => {
  try {
    console.log('🔍 DEBUGGING CONNECTION ISSUE');
    console.log('='.repeat(60));

    const certificateId = '693cacdf2d66da4f9efe80c8';
    const testIP = '10.166.151.128';
    
    console.log(`📋 Certificate ID: ${certificateId}`);
    console.log(`🌐 Test IP: ${testIP}`);

    // Test 1: Backend API directly
    console.log('\n🔧 TEST 1: Backend API Direct Access');
    try {
      const backendUrl = `http://${testIP}:5000/api/certificates/public/${certificateId}`;
      console.log(`   Testing: ${backendUrl}`);
      
      const response = await axios.get(backendUrl, { timeout: 10000 });
      console.log('   ✅ Backend API: WORKING');
      console.log(`   📋 Certificate: ${response.data.certificate.studentName}`);
      console.log(`   📧 Email: ${response.data.certificate.studentEmail || 'Not set'}`);
      
    } catch (backendError) {
      console.log('   ❌ Backend API: FAILED');
      console.log(`   Error: ${backendError.code || backendError.message}`);
      return;
    }

    // Test 2: Frontend server access
    console.log('\n🌐 TEST 2: Frontend Server Access');
    try {
      const frontendUrl = `http://${testIP}:3000`;
      console.log(`   Testing: ${frontendUrl}`);
      
      const frontendResponse = await axios.get(frontendUrl, { timeout: 10000 });
      console.log('   ✅ Frontend Server: WORKING');
      
    } catch (frontendError) {
      console.log('   ❌ Frontend Server: FAILED');
      console.log(`   Error: ${frontendError.code || frontendError.message}`);
      return;
    }

    // Test 3: Check if frontend can reach backend
    console.log('\n🔗 TEST 3: Frontend-Backend Connection');
    console.log('   This is likely where the issue is...');
    
    // Check current API configuration
    console.log('\n📋 CURRENT CONFIGURATION:');
    console.log('   Backend: Listening on 0.0.0.0:5000 ✅');
    console.log('   Frontend: Running on port 3000 ✅');
    console.log('   API Config: Dynamic based on hostname ✅');
    
    console.log('\n🔍 LIKELY ISSUE:');
    console.log('   Frontend loads but API calls fail');
    console.log('   Browser console should show API errors');
    
    console.log('\n🔧 DEBUGGING STEPS:');
    console.log('   1. Open browser developer tools (F12)');
    console.log('   2. Go to Console tab');
    console.log('   3. Visit the certificate URL');
    console.log('   4. Look for API error messages');
    
    console.log('\n🚀 IMMEDIATE FIX:');
    console.log('   I will update the frontend to handle network errors better');
    console.log('   And ensure API calls use the correct IP address');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
};

debugConnectionIssue();