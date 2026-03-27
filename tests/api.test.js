const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../backend/server');
const User = require('../backend/models/User');
const Certificate = require('../backend/models/Certificate');

// Test database
const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/certificate-verification-test';

describe('API Integration Tests', () => {
  let adminToken, institutionToken, studentToken, verifierToken;
  let adminUser, institutionUser, studentUser, verifierUser;
  let certificateId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    // Clean database
    await User.deleteMany({});
    await Certificate.deleteMany({});

    // Create test users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      },
      {
        name: 'Test Institution',
        email: 'institution@test.com',
        password: 'password123',
        role: 'institution',
        organization: 'Test University'
      },
      {
        name: 'Test Student',
        email: 'student@test.com',
        password: 'password123',
        role: 'student'
      },
      {
        name: 'Test Verifier',
        email: 'verifier@test.com',
        password: 'password123',
        role: 'verifier',
        organization: 'Test Verification Co'
      }
    ]);

    [adminUser, institutionUser, studentUser, verifierUser] = users;

    // Get authentication tokens
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminLogin.body.token;

    const institutionLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'institution@test.com', password: 'password123' });
    institutionToken = institutionLogin.body.token;

    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@test.com', password: 'password123' });
    studentToken = studentLogin.body.token;

    const verifierLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'verifier@test.com', password: 'password123' });
    verifierToken = verifierLogin.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/signup', () => {
      it('should register a new user', async () => {
        const userData = {
          name: 'New User',
          email: 'newuser@test.com',
          password: 'password123',
          role: 'student'
        };

        const response = await request(app)
          .post('/api/auth/signup')
          .send(userData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.body.user.email).toBe(userData.email);
        expect(response.body.user.role).toBe(userData.role);
      });

      it('should reject duplicate email', async () => {
        const userData = {
          name: 'Duplicate User',
          email: 'admin@test.com', // Already exists
          password: 'password123',
          role: 'student'
        };

        const response = await request(app)
          .post('/api/auth/signup')
          .send(userData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('already exists');
      });

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/auth/signup')
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Validation failed');
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'admin@test.com',
            password: 'password123'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
        expect(response.body.user.email).toBe('admin@test.com');
      });

      it('should reject invalid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'admin@test.com',
            password: 'wrongpassword'
          })
          .expect(401);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Invalid credentials');
      });
    });

    describe('GET /api/auth/me', () => {
      it('should return current user with valid token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.user.email).toBe('admin@test.com');
      });

      it('should reject request without token', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Certificate Endpoints', () => {
    beforeEach(async () => {
      // Create a test certificate
      const certificate = await Certificate.create({
        studentName: 'Test Student',
        studentEmail: 'student@test.com',
        certificateType: 'Bachelor\'s Degree',
        courseName: 'Computer Science',
        institutionId: institutionUser._id,
        institutionName: 'Test University',
        issueDate: new Date(),
        ipfsHash: 'QmTestHash123',
        issuerAddress: '0x1234567890123456789012345678901234567890'
      });
      certificateId = certificate._id;
    });

    describe('POST /api/certificates', () => {
      it('should allow institution to create certificate', async () => {
        const certificateData = {
          studentName: 'New Student',
          studentEmail: 'newstudent@test.com',
          certificateType: 'Master\'s Degree',
          courseName: 'Data Science',
          issueDate: new Date().toISOString(),
          ipfsHash: 'QmNewHash456',
          issuerAddress: '0x1234567890123456789012345678901234567890'
        };

        const response = await request(app)
          .post('/api/certificates')
          .set('Authorization', `Bearer ${institutionToken}`)
          .send(certificateData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.certificate.studentName).toBe(certificateData.studentName);
        expect(response.body.certificate.certificateType).toBe(certificateData.certificateType);
      });

      it('should reject non-institution users', async () => {
        const certificateData = {
          studentName: 'New Student',
          studentEmail: 'newstudent@test.com',
          certificateType: 'Master\'s Degree',
          courseName: 'Data Science',
          issueDate: new Date().toISOString(),
          ipfsHash: 'QmNewHash456',
          issuerAddress: '0x1234567890123456789012345678901234567890'
        };

        const response = await request(app)
          .post('/api/certificates')
          .set('Authorization', `Bearer ${studentToken}`)
          .send(certificateData)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/certificates/:id', () => {
      it('should return certificate details', async () => {
        const response = await request(app)
          .get(`/api/certificates/${certificateId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.certificate.studentName).toBe('Test Student');
        expect(response.body.certificate.certificateType).toBe('Bachelor\'s Degree');
      });

      it('should return 404 for non-existent certificate', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .get(`/api/certificates/${fakeId}`)
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/certificates/:id/verify', () => {
      it('should verify valid certificate', async () => {
        const response = await request(app)
          .get(`/api/certificates/${certificateId}/verify`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.exists).toBe(true);
        expect(response.body.verificationResult).toBe('invalid'); // Not verified yet
      });

      it('should handle non-existent certificate', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .get(`/api/certificates/${fakeId}/verify`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.exists).toBe(false);
        expect(response.body.verificationResult).toBe('not_found');
      });
    });

    describe('GET /api/certificates/student', () => {
      it('should return student certificates', async () => {
        const response = await request(app)
          .get('/api/certificates/student')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.certificates).toHaveLength(1);
        expect(response.body.certificates[0].studentEmail).toBe('student@test.com');
      });

      it('should reject non-student users', async () => {
        const response = await request(app)
          .get('/api/certificates/student')
          .set('Authorization', `Bearer ${institutionToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/certificates/institution', () => {
      it('should return institution certificates', async () => {
        const response = await request(app)
          .get('/api/certificates/institution')
          .set('Authorization', `Bearer ${institutionToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.certificates).toHaveLength(1);
        expect(response.body.certificates[0].institutionId.toString()).toBe(institutionUser._id.toString());
      });

      it('should reject non-institution users', async () => {
        const response = await request(app)
          .get('/api/certificates/institution')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/certificates/:id/verify', () => {
      it('should allow verifier to mark certificate as verified', async () => {
        const response = await request(app)
          .post(`/api/certificates/${certificateId}/verify`)
          .set('Authorization', `Bearer ${verifierToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.isValid).toBe(true);

        // Check certificate is now verified
        const cert = await Certificate.findById(certificateId);
        expect(cert.isVerified).toBe(true);
      });

      it('should reject non-verifier users', async () => {
        const response = await request(app)
          .post(`/api/certificates/${certificateId}/verify`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/certificates/search', () => {
      it('should search certificates by query', async () => {
        const response = await request(app)
          .get('/api/certificates/search?q=Test Student')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.certificates).toHaveLength(1);
        expect(response.body.certificates[0].studentName).toBe('Test Student');
      });

      it('should return empty results for no matches', async () => {
        const response = await request(app)
          .get('/api/certificates/search?q=Nonexistent Student')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.certificates).toHaveLength(0);
      });

      it('should require search query', async () => {
        const response = await request(app)
          .get('/api/certificates/search')
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Admin Endpoints', () => {
    describe('GET /api/admin/stats', () => {
      it('should return system statistics for admin', async () => {
        const response = await request(app)
          .get('/api/admin/stats')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.totalUsers).toBe(4);
        expect(response.body.totalInstitutions).toBe(1);
        expect(response.body.totalCertificates).toBe(1);
      });

      it('should reject non-admin users', async () => {
        const response = await request(app)
          .get('/api/admin/stats')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/admin/users', () => {
      it('should return all users for admin', async () => {
        const response = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.users).toHaveLength(4);
        expect(response.body.total).toBe(4);
      });

      it('should support pagination', async () => {
        const response = await request(app)
          .get('/api/admin/users?page=1&limit=2')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.users).toHaveLength(2);
        expect(response.body.page).toBe(1);
        expect(response.body.pages).toBe(2);
      });

      it('should support role filtering', async () => {
        const response = await request(app)
          .get('/api/admin/users?role=student')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.users).toHaveLength(1);
        expect(response.body.users[0].role).toBe('student');
      });
    });

    describe('PATCH /api/admin/users/:id/status', () => {
      it('should allow admin to deactivate user', async () => {
        const response = await request(app)
          .patch(`/api/admin/users/${studentUser._id}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ isActive: false })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.user.isActive).toBe(false);

        // Verify user is deactivated
        const user = await User.findById(studentUser._id);
        expect(user.isActive).toBe(false);
      });

      it('should reject non-admin users', async () => {
        const response = await request(app)
          .patch(`/api/admin/users/${studentUser._id}/status`)
          .set('Authorization', `Bearer ${studentToken}`)
          .send({ isActive: false })
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Verifier Endpoints', () => {
    describe('GET /api/verifier/stats', () => {
      it('should return verifier statistics', async () => {
        const response = await request(app)
          .get('/api/verifier/stats')
          .set('Authorization', `Bearer ${verifierToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.totalVerifications).toBe(0);
        expect(response.body.validCertificates).toBe(0);
      });

      it('should reject non-verifier users', async () => {
        const response = await request(app)
          .get('/api/verifier/stats')
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/verifier/search', () => {
      it('should allow verifier to search certificates', async () => {
        const response = await request(app)
          .get('/api/verifier/search?q=Test Student')
          .set('Authorization', `Bearer ${verifierToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.certificates).toHaveLength(1);
        expect(response.body.certificates[0].verificationStatus).toBeDefined();
      });

      it('should require search query', async () => {
        const response = await request(app)
          .get('/api/verifier/search')
          .set('Authorization', `Bearer ${verifierToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid MongoDB ObjectId', async () => {
      const response = await request(app)
        .get('/api/certificates/invalid-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should handle missing authorization header', async () => {
      const response = await request(app)
        .get('/api/certificates/student')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should handle invalid JWT token', async () => {
      const response = await request(app)
        .get('/api/certificates/student')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to auth endpoints', async () => {
      // Make multiple rapid requests
      const promises = Array(10).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({ email: 'test@test.com', password: 'wrong' })
      );

      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should validate email format in signup', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
          role: 'student'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should validate required fields in certificate creation', async () => {
      const response = await request(app)
        .post('/api/certificates')
        .set('Authorization', `Bearer ${institutionToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });
});