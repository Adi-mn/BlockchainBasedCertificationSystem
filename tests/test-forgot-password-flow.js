const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../backend/models/User');
const crypto = require('crypto');
require('dotenv').config({ path: './backend/.env' });

const API_URL = 'http://localhost:5000/api/auth';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';
const NEW_PASSWORD = 'newpassword123';

async function runTest() {
    console.log('🚀 Starting Forgot Password Flow Test');

    try {
        // 1. Connect to Database (to read OTP)
        console.log('📦 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 2. Register Test User
        console.log('👤 Registering test user...');
        try {
            await axios.post(`${API_URL}/signup`, {
                name: 'Test User',
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                role: 'student'
            });
            console.log('✅ User registered');
        } catch (e) {
            console.log('⚠️ User might already exist, continuing...');
        }

        // 3. Request OTP
        console.log('📧 Requesting OTP...');
        await axios.post(`${API_URL}/forgot-password`, { email: TEST_EMAIL });
        console.log('✅ OTP requested (Email sent mocked)');

        // 4. Retrieve OTP from DB (Simulating email read)
        console.log('🔍 Retrieving OTP from database...');
        const user = await User.findOne({ email: TEST_EMAIL }).select('+otp');
        if (!user || !user.otp) {
            throw new Error('OTP not found in database');
        }

        // The OTP in DB is hashed: "salt:hash"
        // We cannot trigger the verify endpoint without the PLAIN OTP.
        // Wait... we implemented hashing. So we can't retrieve the plain OTP from the DB!
        // This makes automated testing hard without mocking the random generation or the email service.

        // ALTERNATIVE: Since we are in the same process/codebase context locally, 
        // we can't easily intercept the partial logic.

        // BUT checking the code: 
        // const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // It's random.

        // FOR TESTING PURPOSE: I will manually update the user in DB with a KNOWN OTP hash 
        // so I can pass the verification step.

        const KNOWN_OTP = '123456';
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(KNOWN_OTP, salt, 1000, 64, 'sha512').toString('hex');
        user.otp = `${salt}:${hash}`;
        user.otpExpire = Date.now() + 10 * 60 * 1000;
        user.otpAttempts = 0;
        await user.save({ validateBeforeSave: false });

        console.log(`✅ Database patched with known OTP: ${KNOWN_OTP}`);

        // 5. Verify OTP
        console.log('🔑 Verifying OTP...');
        const verifyRes = await axios.post(`${API_URL}/verify-otp`, {
            email: TEST_EMAIL,
            otp: KNOWN_OTP
        });
        console.log('✅ OTP Verified');
        const resetToken = verifyRes.data.resetToken;

        // 6. Reset Password
        console.log('🔄 Resetting Password...');
        await axios.post(`${API_URL}/reset-password`, {
            resetToken,
            password: NEW_PASSWORD
        });
        console.log('✅ Password Reset Successfully');

        // 7. Login with Old Password (Should fail)
        console.log('🧪 Testing Login with OLD password (should fail)...');
        try {
            await axios.post(`${API_URL}/login`, {
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            });
            throw new Error('Login with old password should have failed');
        } catch (e) {
            if (e.response && e.response.status === 401) {
                console.log('✅ Login failed as expected');
            } else {
                throw e;
            }
        }

        // 8. Login with New Password (Should success)
        console.log('🧪 Testing Login with NEW password...');
        await axios.post(`${API_URL}/login`, {
            email: TEST_EMAIL,
            password: NEW_PASSWORD
        });
        console.log('✅ Login successful with new password');

        console.log('🎉 ALL TESTS PASSED');

    } catch (error) {
        console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
    } finally {
        await mongoose.connection.close();
    }
}

runTest();
