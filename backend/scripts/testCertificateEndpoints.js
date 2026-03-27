const axios = require('axios');
const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

const testCertificateEndpoints = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate-verification');
    console.log('✅ Connected to MongoDB');

    // Get a sample certificate ID
    const sampleCert = await Certificate.findOne({});
    if (!sampleCert) {
      console.log('❌ No certificates found in database');
      return;
    }

    const certId = sampleCert._id.toString();
    console.log(`📋 Testing with certificate ID: ${certId}`);
    console.log(`Student: ${sampleCert.studentName}, Course: ${sampleCert.courseName}`);

    // Test 1: Get single certificate (public endpoint)
    console.log('\n🔍 Test 1: Get single certificate (public)...');
    try {
      const response = await axios.get(`${API_BASE}/certificates/${certId}`);
      console.log('✅ Success:', response.data.success);
      console.log('Certificate found:', response.data.certificate.studentName);
    } catch (error) {
      console.error('❌ Failed:', error.response?.data || error.message);
    }

    // Test 2: Login as institution and get certificate
    console.log('\n🔐 Test 2: Institution login and certificate access...');
    try {
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: 'institution@demo.com',
        password: 'password123'
      });
      
      const token = loginRes.data.token;
      console.log('✅ Institution login successful');

      const certRes = await axios.get(`${API_BASE}/certificates/${certId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Certificate access with auth successful');
      console.log('Certificate:', certRes.data.certificate.studentName);
    } catch (error) {
      console.error('❌ Failed:', error.response?.data || error.message);
    }

    // Test 3: Login as student and get certificate
    console.log('\n👨‍🎓 Test 3: Student login and certificate access...');
    try {
      const studentLoginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: 'student1@demo.com',
        password: 'password123'
      });
      
      const studentToken = studentLoginRes.data.token;
      console.log('✅ Student login successful');

      const studentCertRes = await axios.get(`${API_BASE}/certificates/${certId}`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      
      console.log('✅ Certificate access by student successful');
      console.log('Certificate:', studentCertRes.data.certificate.studentName);
    } catch (error) {
      console.error('❌ Failed:', error.response?.data || error.message);
    }

    // Test 4: Test certificate verification endpoint
    console.log('\n🔍 Test 4: Certificate verification endpoint...');
    try {
      const verifyRes = await axios.get(`${API_BASE}/certificates/${certId}/verify`);
      console.log('✅ Verification successful');
      console.log('Verification result:', verifyRes.data.verificationResult);
      console.log('Certificate exists:', verifyRes.data.exists);
    } catch (error) {
      console.error('❌ Failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 All certificate endpoint tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

testCertificateEndpoints();