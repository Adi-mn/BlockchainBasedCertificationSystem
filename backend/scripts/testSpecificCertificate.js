const axios = require('axios');

const testSpecificCertificate = async () => {
  try {
    console.log('🔍 TESTING SPECIFIC CERTIFICATE');
    console.log('='.repeat(50));

    const certificateId = '693cacdf2d66da4f9efe80c8';
    const studentEmail = 'tfgyhu@gmail.com';
    
    console.log(`📧 Student Email: ${studentEmail}`);
    console.log(`📋 Certificate ID: ${certificateId}`);
    console.log(`🔗 QR URL: http://localhost:3000/certificate/${certificateId}`);

    // Test if this certificate exists
    console.log('\n🔍 Testing certificate existence...');
    
    try {
      const publicRes = await axios.get(`http://localhost:5000/api/certificates/public/${certificateId}`);
      const cert = publicRes.data.certificate;
      
      console.log('✅ Certificate found!');
      console.log(`   👤 Student: ${cert.studentName}`);
      console.log(`   📧 Email: ${cert.studentEmail}`);
      console.log(`   📚 Course: ${cert.courseName}`);
      console.log(`   🏢 Institution: ${cert.institutionName}`);
      console.log(`   📅 Date: ${new Date(cert.issueDate).toLocaleDateString()}`);
      console.log(`   🎯 Grade: ${cert.grade || 'N/A'}`);
      console.log(`   ✅ Verified: ${cert.isVerified ? 'Yes' : 'No'}`);
      
    } catch (publicError) {
      console.log(`❌ Certificate not found: ${publicError.response?.status} - ${publicError.response?.statusText}`);
      
      // Try to find certificate by email
      console.log('\n🔍 Searching for certificate by email...');
      try {
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
          email: 'admin@demo.com',
          password: 'password123'
        });
        
        const token = loginRes.data.token;
        const searchRes = await axios.get(`http://localhost:5000/api/certificates/search?q=${studentEmail}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (searchRes.data.certificates && searchRes.data.certificates.length > 0) {
          console.log(`✅ Found ${searchRes.data.certificates.length} certificate(s) for ${studentEmail}:`);
          searchRes.data.certificates.forEach((cert, index) => {
            console.log(`   ${index + 1}. ${cert.studentName} - ${cert.courseName} (ID: ${cert._id})`);
          });
        } else {
          console.log(`❌ No certificates found for ${studentEmail}`);
        }
        
      } catch (searchError) {
        console.log(`❌ Search failed: ${searchError.response?.status}`);
      }
      
      return;
    }

    // Test verification endpoint
    console.log('\n🔍 Testing verification endpoint...');
    try {
      const verifyRes = await axios.get(`http://localhost:5000/api/certificates/${certificateId}/verify`);
      console.log(`✅ Verification works: ${verifyRes.data.verificationResult}`);
    } catch (verifyError) {
      console.log(`❌ Verification failed: ${verifyError.response?.status} - ${verifyError.response?.statusText}`);
    }

    // Test download
    console.log('\n📥 Testing download...');
    try {
      const downloadRes = await axios.get(`http://localhost:5000/api/certificates/${certificateId}/public-download`, {
        responseType: 'arraybuffer'
      });
      console.log(`✅ Download works: ${downloadRes.data.byteLength} bytes`);
    } catch (downloadError) {
      console.log(`❌ Download failed: ${downloadError.response?.status} - ${downloadError.response?.statusText}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 DIAGNOSIS:');
    console.log('');
    console.log('📱 QR CODE URL:');
    console.log(`   http://localhost:3000/certificate/${certificateId}`);
    console.log('');
    console.log('🔍 VERIFICATION URL:');
    console.log(`   http://localhost:3000/verify/${certificateId}`);
    console.log('');
    console.log('📋 WHAT SHOULD HAPPEN WHEN SCANNED:');
    console.log('   ✅ Shows complete certificate details');
    console.log('   ✅ Student name, course, institution visible');
    console.log('   ✅ Download and share buttons available');
    console.log('   ✅ Mobile-optimized layout');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testSpecificCertificate();