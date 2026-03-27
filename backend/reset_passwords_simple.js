
const mongoose = require('mongoose');
const User = require('./models/User');

const DB_URI = 'mongodb://localhost:27017/certificate-verification';

async function run() {
    try {
        await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB');

        console.log('Resetting passwords for ALL students to "password123" (Simple format)...');

        // Find all students
        const students = await User.find({ role: 'student' });
        console.log(`Found ${students.length} students.`);

        for (const student of students) {
            student.password = 'password123';
            await student.save();
            console.log(`✅ Updated password for: ${student.email}`);
        }

        console.log('--- PASSWORD RESET COMPLETE ---');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

run();
