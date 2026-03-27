const axios = require('axios');

const testQRIssue = async () => {
  try {
    console.log('🔍 TESTING QR VERIFICATION ISSUE');
    console.log('='.repeat(50));

    // Test with a known certificate ID (replace with actual ID from your system)
    const testCertId = '693c9d76b563d7f01e64c53b'; // From your error message
    
    console.log(`📋 Testing certificate ID: ${testCertId}`);
    
    // Test public certificate access
    try {
      const publicRes = await axios.get(`http://localhost:5000/api/certificates/public/${testCertId}`);
      
      console.log('✅ Certificate found via public API');
      const cert = publicRes.data.certificate;
      
      console.log('\\n📋 CERTIFICATE DETAILS:');
      console.log(`   Student Name: ${cert.studentName}`);
      console.log(`   Course Name: ${cert.courseName}`);
      console.log(`   Institution: ${cert.institutionName}`);
      console.log(`   Certificate Type: ${cert.certificateType}`);
      console.log(`   Issue Date: ${cert.issueDate}`);
      console.log(`   Grade: ${cert.grade || 'N/A'}`);
      
      console.log('\\n🔍 VERIFICATION STATUS:');
      console.log(`   Is Verified: ${cert.isVerified}`);
      console.log(`   Is Revoked: ${cert.isRevoked}`);
      console.log(`   Blockchain ID: ${cert.blockchainId || 'NULL (causing partial verification)'}`);
      console.log(`   IPFS Hash: ${cert.ipfsHash || 'NULL'}`);
      console.log(`   Transaction Hash: ${cert.transactionHash || 'NULL'}`);
      
      // Analyze why showing partial verification
      console.log('\\n⚠️ PARTIAL VERIFICATION ANALYSIS:');
      if (!cert.blockchainId || cert.blockchainId === 'pending') {
        console.log('   🔍 CAUSE: blockchainId is missing or pending');
        console.log('   💡 SOLUTION: Certificate needs blockchain recording');
      }
      
      if (!cert.ipfsHash || cert.ipfsHash === 'pending') {
        console.log('   🔍 CAUSE: ipfsHash is missing or pending');
        console.log('   💡 SOLUTION: Certificate needs IPFS storage');
      }
      
      console.log('\\n📱 MOBILE QR SCAN EXPERIENCE:');
      console.log(`   URL: http://localhost:3000/certificate/${testCertId}`);
      console.log('   Mobile users should see:');
      console.log(`   ✅ Student: ${cert.studentName}`);
      console.log(`   ✅ Course: ${cert.courseName}`);
      console.log(`   ✅ Institution: ${cert.institutionName}`);
      console.log(`   ✅ Date: ${cert.issueDate}`);
      console.log(`   ✅ Type: ${cert.certificateType}`);
      console.log(`   ⚠️ Status: ${cert.blockchainId ? 'Fully Verified' : 'Partially Verified'}`);
      
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Certificate not found with that ID');
        console.log('   This could be why QR scan is not working');
      } else {
        console.log('❌ API Error:', error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ QR test failed:', error);
  }
};

testQRIssue();