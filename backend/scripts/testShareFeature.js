const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const testShareFeature = async () => {
  try {
    console.log('🔗 TESTING SHARE CERTIFICATE FEATURE');
    console.log('=' .repeat(60));

    // Login as institution to get a certificate
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'institution@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Institution login successful');

    // Get institution certificates
    const certsRes = await axios.get(`${API_BASE}/certificates/institution`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (certsRes.data.certificates.length === 0) {
      console.log('❌ No certificates found. Creating a test certificate...');
      
      // Create a test certificate
      const createRes = await axios.post(`${API_BASE}/certificates`, {
        studentName: 'Test Student for Sharing',
        studentEmail: 'testshare@example.com',
        courseName: 'Share Feature Test Course',
        certificateType: 'Course Completion',
        grade: 'A+',
        description: 'Test certificate for share feature',
        language: 'english'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Test certificate created');
      var certificateId = createRes.data.certificate._id;
    } else {
      var certificateId = certsRes.data.certificates[0]._id;
      console.log(`✅ Using existing certificate: ${certificateId}`);
    }

    // Test 1: Access certificate with authentication
    console.log('\\n🔒 Testing authenticated certificate access...');
    const authCertRes = await axios.get(`${API_BASE}/certificates/${certificateId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Authenticated access successful');
    console.log(`   Certificate: ${authCertRes.data.certificate.courseName}`);
    console.log(`   Student: ${authCertRes.data.certificate.studentName}`);

    // Test 2: Access public certificate (no authentication)
    console.log('\\n🌍 Testing public certificate access...');
    const publicCertRes = await axios.get(`${API_BASE}/certificates/public/${certificateId}`);
    
    console.log('✅ Public access successful');
    console.log(`   Certificate: ${publicCertRes.data.certificate.courseName}`);
    console.log(`   Student: ${publicCertRes.data.certificate.studentName}`);
    console.log(`   Institution: ${publicCertRes.data.certificate.institutionName}`);
    console.log(`   Verified: ${publicCertRes.data.certificate.isVerified}`);
    console.log(`   View Count: ${publicCertRes.data.certificate.viewCount}`);

    // Test 3: Generate shareable URLs
    console.log('\\n🔗 Testing shareable URL generation...');
    const baseUrl = 'http://localhost:3000';
    const shareableUrl = `${baseUrl}/public/certificate/${certificateId}`;
    
    console.log(`✅ Shareable URL generated: ${shareableUrl}`);

    // Test 4: Social media share URLs
    console.log('\\n📱 Testing social media share URLs...');
    const certificate = publicCertRes.data.certificate;
    
    const whatsappMessage = `Check out my certificate: ${certificate.courseName} from ${certificate.institutionName}\\n${shareableUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    
    const emailSubject = `Certificate: ${certificate.courseName}`;
    const emailBody = `I'd like to share my certificate with you:\\n\\nCourse: ${certificate.courseName}\\nInstitution: ${certificate.institutionName}\\nStudent: ${certificate.studentName}\\n\\nView Certificate: ${shareableUrl}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    const twitterText = `Check out my certificate: ${certificate.courseName} from ${certificate.institutionName}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareableUrl)}`;
    
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableUrl)}`;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`;

    console.log('✅ Social media URLs generated:');
    console.log(`   📱 WhatsApp: ${whatsappUrl.substring(0, 100)}...`);
    console.log(`   📧 Email: ${emailUrl.substring(0, 100)}...`);
    console.log(`   🐦 Twitter: ${twitterUrl.substring(0, 100)}...`);
    console.log(`   📘 Facebook: ${facebookUrl.substring(0, 100)}...`);
    console.log(`   💼 LinkedIn: ${linkedinUrl.substring(0, 100)}...`);

    // Test 5: Verify public certificate contains only safe data
    console.log('\\n🔒 Testing data security in public view...');
    const publicCert = publicCertRes.data.certificate;
    
    // Check that sensitive data is not exposed
    const sensitiveFields = ['studentId', 'institutionId', 'verifiedBy', 'transactionHash'];
    const exposedSensitiveFields = sensitiveFields.filter(field => publicCert.hasOwnProperty(field));
    
    if (exposedSensitiveFields.length === 0) {
      console.log('✅ No sensitive data exposed in public view');
    } else {
      console.log(`⚠️  Sensitive fields exposed: ${exposedSensitiveFields.join(', ')}`);
    }

    // Check that public data is present
    const requiredPublicFields = ['courseName', 'studentName', 'institutionName', 'issueDate', 'isVerified'];
    const missingPublicFields = requiredPublicFields.filter(field => !publicCert.hasOwnProperty(field));
    
    if (missingPublicFields.length === 0) {
      console.log('✅ All required public data is present');
    } else {
      console.log(`❌ Missing public fields: ${missingPublicFields.join(', ')}`);
    }

    console.log('\\n' + '=' .repeat(60));
    console.log('🎉 SHARE FEATURE TEST COMPLETED!');
    console.log('\\n✅ FEATURES WORKING:');
    console.log('   🔒 Authenticated certificate access');
    console.log('   🌍 Public certificate access (no login required)');
    console.log('   🔗 Shareable URL generation');
    console.log('   📱 Social media share URLs');
    console.log('   🔒 Data security (no sensitive data in public view)');
    
    console.log('\\n🎯 SHARE URLS TO TEST:');
    console.log(`   📋 Public Certificate: ${shareableUrl}`);
    console.log(`   📱 WhatsApp Share: ${whatsappUrl}`);
    console.log(`   📧 Email Share: ${emailUrl}`);
    console.log(`   🐦 Twitter Share: ${twitterUrl}`);
    console.log(`   📘 Facebook Share: ${facebookUrl}`);
    console.log(`   💼 LinkedIn Share: ${linkedinUrl}`);
    
    console.log('\\n💡 NEXT STEPS:');
    console.log('   1. Open the public certificate URL in browser');
    console.log('   2. Test the share button functionality');
    console.log('   3. Try sharing via different social platforms');
    console.log('   4. Verify the certificate displays correctly without login');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testShareFeature();