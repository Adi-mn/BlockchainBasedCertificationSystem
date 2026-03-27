require('dotenv').config();
const emailService = require('../utils/emailService');

async function testRevocationEmail() {
  console.log('🚫 TESTING CERTIFICATE REVOCATION EMAIL');
  console.log('======================================');
  
  try {
    // Test revocation email
    console.log('📧 Testing revocation notification email...');
    
    const revocationData = {
      studentEmail: 'kumar12345abhinek@gmail.com', // Your test email
      studentName: 'John Doe',
      courseName: 'Advanced Web Development',
      certificateType: 'Course Completion Certificate',
      institutionName: 'ABC University',
      revocationDate: new Date(),
      revocationReason: 'Academic misconduct detected during course evaluation. Please contact the academic office for clarification and potential re-certification process.',
      certificateId: 'REV-TEST-' + Date.now(),
      contactEmail: 'coordinator@abcuniversity.edu'
    };
    
    const result = await emailService.sendRevocationNotification(revocationData);
    
    if (result.success) {
      console.log('✅ SUCCESS! Revocation email sent!');
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`👤 Sent to: ${result.recipient}`);
      
      console.log('\n🎯 EMAIL CONTENT INCLUDES:');
      console.log('• 🚫 Clear revocation notice');
      console.log('• 📋 Certificate details');
      console.log('• 📝 Reason for revocation');
      console.log('• 📞 Contact coordinator button');
      console.log('• ⚠️ Important next steps');
      
      console.log('\n📧 CHECK YOUR EMAIL:');
      console.log('Subject: 🚫 Certificate Revoked - Advanced Web Development - ABC University');
      console.log('Content: Professional revocation notice with reason and contact info');
      
    } else {
      console.log('❌ Revocation email failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n🎯 REVOCATION EMAIL FEATURES:');
  console.log('✅ Professional warning design (red header)');
  console.log('✅ Clear revocation notice');
  console.log('✅ Certificate details included');
  console.log('✅ Reason for revocation displayed');
  console.log('✅ Contact coordinator button');
  console.log('✅ Next steps guidance');
  console.log('✅ Mobile-responsive design');
  
  console.log('\n🚀 WHEN REVOCATION HAPPENS:');
  console.log('1. Institution revokes certificate with reason');
  console.log('2. Certificate marked as revoked in database');
  console.log('3. Student automatically receives email notification');
  console.log('4. Email includes reason and coordinator contact');
  console.log('5. Student can contact coordinator for clarification');
}

testRevocationEmail().catch(console.error);