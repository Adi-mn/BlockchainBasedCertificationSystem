const axios = require('axios');

const testSimpleDownload = async () => {
  try {
    console.log('📥 TESTING SIMPLE PUBLIC DOWNLOAD');
    console.log('='.repeat(40));

    // Get an existing verified certificate
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    const certsRes = await axios.get('http://localhost:5000/api/certificates', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const certificates = certsRes.data.certificates || [];
    const verifiedCert = certificates.find(cert => cert.isVerified);
    
    if (!verifiedCert) {
      console.log('No verified certificates found, creating one...');
      
      // Create and verify a simple certificate
      const certData = {
        studentName: 'Simple Download Test',
        studentEmail: 'simpledownload@test.com',
        certificateType: 'Course Completion',
        courseName: 'Simple Download Course',
        issueDate: new Date().toISOString(),
        grade: 'A',
        ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        issuerAddress: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87'
      };

      const createRes = await axios.post('http://localhost:5000/api/certificates', certData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const certId = createRes.data.certificate._id;
      
      // Verify it
      await axios.post(`http://localhost:5000/api/certificates/${certId}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`✅ Created and verified certificate: ${certId}`);
      
      // Test download
      try {
        const downloadRes = await axios.get(`http://localhost:5000/api/certificates/${certId}/public-download`, {
          responseType: 'arraybuffer'
        });
        
        console.log(`✅ Download successful: ${downloadRes.data.byteLength} bytes`);
      } catch (downloadError) {
        console.log(`❌ Download failed: ${downloadError.response?.status} - ${downloadError.message}`);
        console.log('Error details:', downloadError.response?.data?.toString());
      }
    } else {
      console.log(`Using existing verified certificate: ${verifiedCert._id}`);
      
      // Test download
      try {
        const downloadRes = await axios.get(`http://localhost:5000/api/certificates/${verifiedCert._id}/public-download`, {
          responseType: 'arraybuffer'
        });
        
        console.log(`✅ Download successful: ${downloadRes.data.byteLength} bytes`);
      } catch (downloadError) {
        console.log(`❌ Download failed: ${downloadError.response?.status} - ${downloadError.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testSimpleDownload();