const axios = require('axios');

const diagnoseNetworkIssue = async () => {
  try {
    console.log('🔍 DIAGNOSING NETWORK CONNECTIVITY ISSUE');
    console.log('='.repeat(60));

    const certificateId = '693cacdf2d66da4f9efe80c8';
    
    console.log('📋 Testing localhost access (from computer)...');
    
    // Test localhost backend
    try {
      const backendTest = await axios.get(`http://localhost:5000/api/certificates/public/${certificateId}`);
      console.log('✅ Backend (localhost:5000): Working');
      console.log(`   Certificate: ${backendTest.data.certificate.studentName}`);
    } catch (backendError) {
      console.log('❌ Backend (localhost:5000): Failed');
      console.log(`   Error: ${backendError.message}`);
    }

    // Test localhost frontend
    try {
      const frontendTest = await axios.get('http://localhost:3000');
      console.log('✅ Frontend (localhost:3000): Working');
    } catch (frontendError) {
      console.log('❌ Frontend (localhost:3000): Failed');
      console.log(`   Error: ${frontendError.message}`);
    }

    console.log('\n🔍 NETWORK ISSUE DIAGNOSIS:');
    console.log('');
    console.log('❌ PROBLEM: Phone shows "Certificate not found"');
    console.log('');
    console.log('🔍 POSSIBLE CAUSES:');
    console.log('   1. Phone can\'t reach backend server (port 5000)');
    console.log('   2. Frontend loads but can\'t fetch data from backend');
    console.log('   3. Firewall blocking external access to ports');
    console.log('   4. Backend not configured to accept external connections');
    console.log('');
    console.log('✅ SOLUTIONS:');
    console.log('');
    console.log('🔧 SOLUTION 1: Configure Backend for External Access');
    console.log('   • Backend needs to listen on 0.0.0.0 (all interfaces)');
    console.log('   • Currently might only listen on localhost');
    console.log('');
    console.log('🔧 SOLUTION 2: Update Frontend API URL');
    console.log('   • Frontend needs to use IP address for API calls');
    console.log('   • Currently uses localhost in API calls');
    console.log('');
    console.log('🔧 SOLUTION 3: Test Network Connectivity');
    console.log('   • Ensure phone and computer on same network');
    console.log('   • Test if phone can ping computer IP');
    console.log('');
    console.log('📱 IMMEDIATE TESTS TO TRY:');
    console.log('');
    console.log('1. 🌐 Test Frontend Access:');
    console.log('   • Open http://192.168.137.1:3000 on phone browser');
    console.log('   • See if main website loads');
    console.log('');
    console.log('2. 🔧 Test Backend Access:');
    console.log('   • Open http://192.168.137.1:5000 on phone browser');
    console.log('   • Should show "Cannot GET /" (means backend reachable)');
    console.log('');
    console.log('3. 📋 Test API Directly:');
    console.log('   • Try: http://192.168.137.1:5000/api/certificates/public/693cacdf2d66da4f9efe80c8');
    console.log('   • Should show certificate JSON data');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('   1. Test the URLs above on your phone');
    console.log('   2. Report which ones work/fail');
    console.log('   3. I\'ll configure the servers for external access');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
};

diagnoseNetworkIssue();