const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
require('dotenv').config();

const setupDemoData = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate-verification');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing demo data...');
    await User.deleteMany({ email: { $regex: '@demo\.com$' } });
    await Certificate.deleteMany({});

    // Create demo users
    console.log('👥 Creating demo users...');
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      },
      {
        name: 'ABC University',
        email: 'institution@demo.com',
        password: hashedPassword,
        role: 'institution',
        organization: 'ABC University',
        isVerified: true
      },
      {
        name: 'John Doe',
        email: 'student1@demo.com',
        password: hashedPassword,
        role: 'student',
        isVerified: true
      },
      {
        name: 'Jane Smith',
        email: 'student2@demo.com',
        password: hashedPassword,
        role: 'student',
        isVerified: true
      },
      {
        name: 'Mike Johnson',
        email: 'student3@demo.com',
        password: hashedPassword,
        role: 'student',
        isVerified: true
      },
      {
        name: 'Certificate Verifier',
        email: 'verifier@demo.com',
        password: hashedPassword,
        role: 'verifier',
        organization: 'Verification Authority',
        isVerified: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} demo users`);

    // Find institution user
    const institution = createdUsers.find(user => user.role === 'institution');
    
    // Create demo certificates
    console.log('📜 Creating demo certificates...');
    
    const certificates = [
      {
        studentName: 'John Doe',
        studentEmail: 'student1@demo.com',
        certificateType: 'Course Completion',
        courseName: 'Web Development Fundamentals',
        institutionId: institution._id,
        institutionName: 'ABC University',
        issueDate: new Date('2024-01-15'),
        grade: 'A+',
        description: 'Successfully completed the comprehensive web development course covering HTML, CSS, JavaScript, and React.',
        ipfsHash: 'QmSampleHash1',
        issuerAddress: '0x1234567890123456789012345678901234567890',
        isVerified: true,
        language: 'english'
      },
      {
        studentName: 'Jane Smith',
        studentEmail: 'student2@demo.com',
        certificateType: 'Course Completion',
        courseName: 'Data Science with Python',
        institutionId: institution._id,
        institutionName: 'ABC University',
        issueDate: new Date('2024-02-20'),
        grade: 'A',
        description: 'Completed advanced data science course including machine learning, data visualization, and statistical analysis.',
        ipfsHash: 'QmSampleHash2',
        issuerAddress: '0x1234567890123456789012345678901234567890',
        isVerified: true,
        language: 'english'
      },
      {
        studentName: 'Mike Johnson',
        studentEmail: 'student3@demo.com',
        certificateType: 'Course Completion',
        courseName: 'Digital Marketing Mastery',
        institutionId: institution._id,
        institutionName: 'ABC University',
        issueDate: new Date('2024-03-10'),
        grade: 'B+',
        description: 'Comprehensive digital marketing course covering SEO, social media marketing, and analytics.',
        ipfsHash: 'QmSampleHash3',
        issuerAddress: '0x1234567890123456789012345678901234567890',
        isVerified: false,
        language: 'english'
      },
      // Multilingual certificate example
      {
        studentName: 'राहुल शर्मा',
        studentEmail: 'student1@demo.com',
        certificateType: 'Course Completion',
        courseName: 'कंप्यूटर साइंस बेसिक्स',
        institutionId: institution._id,
        institutionName: 'ABC University',
        issueDate: new Date('2024-03-15'),
        grade: 'A',
        description: 'कंप्यूटर साइंस के मूलभूत सिद्धांतों में सफलतापूर्वक प्रमाणित।',
        ipfsHash: 'QmSampleHash4',
        issuerAddress: '0x1234567890123456789012345678901234567890',
        isVerified: true,
        language: 'hindi',
        certificateData: {
          language: 'hindi',
          translations: {
            certificateOfCompletion: 'पूर्णता प्रमाणपत्र'
          }
        }
      },
      // Auto-generated certificate example
      {
        studentName: 'Jane Smith',
        studentEmail: 'student2@demo.com',
        certificateType: 'Professional Certification',
        courseName: 'Advanced JavaScript Programming',
        institutionId: institution._id,
        institutionName: 'ABC University',
        issueDate: new Date('2024-03-20'),
        grade: 'A+',
        description: 'Excellence in advanced JavaScript concepts including ES6+, async programming, and frameworks.',
        ipfsHash: 'QmSampleHash5',
        issuerAddress: '0x1234567890123456789012345678901234567890',
        isVerified: true,
        language: 'english',
        certificateData: {
          teacherName: 'Prof. Sarah Wilson',
          template: 'modern',
          autoGenerated: true,
          generationMethod: 'auto-template',
          templateEngine: 'v1.0'
        }
      }
    ];

    const createdCertificates = await Certificate.insertMany(certificates);
    console.log(`✅ Created ${createdCertificates.length} demo certificates`);

    console.log('\n🎉 Demo data setup complete!');
    console.log('\n📋 Demo Accounts:');
    console.log('Admin: admin@demo.com / password123');
    console.log('Institution: institution@demo.com / password123');
    console.log('Student 1: student1@demo.com / password123');
    console.log('Student 2: student2@demo.com / password123');
    console.log('Student 3: student3@demo.com / password123');
    console.log('Verifier: verifier@demo.com / password123');
    
    console.log('\n📊 Statistics:');
    console.log(`- Total Users: ${createdUsers.length}`);
    console.log(`- Total Certificates: ${createdCertificates.length}`);
    console.log(`- Verified Certificates: ${createdCertificates.filter(c => c.isVerified).length}`);
    console.log(`- Multilingual Certificates: ${createdCertificates.filter(c => c.language !== 'english').length}`);
    console.log(`- Auto-generated Certificates: ${createdCertificates.filter(c => c.certificateData?.autoGenerated).length}`);

  } catch (error) {
    console.error('❌ Error setting up demo data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

setupDemoData();