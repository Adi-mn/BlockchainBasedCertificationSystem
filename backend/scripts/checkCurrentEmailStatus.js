require('dotenv').config();

console.log('🔍 CURRENT EMAIL CONFIGURATION STATUS');
console.log('====================================');
console.log('');

// Check environment variables
console.log('📋 ENVIRONMENT VARIABLES:');
console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ Not set');
console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 
  (process.env.EMAIL_APP_PASSWORD === 'your-app-password-here' ? '⚠️ Still placeholder' : '✅ Set') : 
  '❌ Not set');
console.log('EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME || '❌ Not set');
console.log('');

// Check if using regular password (common mistake)
if (process.env.EMAIL_APP_PASSWORD && process.env.EMAIL_APP_PASSWORD.includes('@')) {
  console.log('🚨 ERROR: You are using your regular Gmail password!');
  console.log('   Gmail requires an "App Password" for SMTP authentication.');
  console.log('   Your regular password will NOT work.');
  console.log('');
} else if (process.env.EMAIL_APP_PASSWORD === 'your-app-password-here') {
  console.log('⚠️  WARNING: EMAIL_APP_PASSWORD is still placeholder value');
  console.log('');
}

// Provide next steps
console.log('📋 NEXT STEPS:');
if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-gmail@gmail.com') {
  console.log('1. ❌ Set EMAIL_USER to your Gmail address');
} else {
  console.log('1. ✅ EMAIL_USER is configured');
}

if (!process.env.EMAIL_APP_PASSWORD || 
    process.env.EMAIL_APP_PASSWORD === 'your-app-password-here' ||
    process.env.EMAIL_APP_PASSWORD.includes('@')) {
  console.log('2. ❌ Get Gmail App Password:');
  console.log('   • Enable 2FA on Gmail');
  console.log('   • Generate App Password');
  console.log('   • Update EMAIL_APP_PASSWORD in .env');
} else {
  console.log('2. ✅ EMAIL_APP_PASSWORD appears to be configured');
}

console.log('3. 🔄 Restart backend server');
console.log('4. 🧪 Test with: node scripts/quickEmailTest.js');
console.log('');

console.log('🔗 HELPFUL LINKS:');
console.log('• Gmail Account Settings: https://myaccount.google.com/');
console.log('• Setup Guide: Run "node scripts/gmailSetupGuide.js"');
console.log('');

if (process.env.EMAIL_USER && 
    process.env.EMAIL_APP_PASSWORD && 
    process.env.EMAIL_APP_PASSWORD !== 'your-app-password-here' &&
    !process.env.EMAIL_APP_PASSWORD.includes('@')) {
  console.log('🎯 CONFIGURATION LOOKS GOOD!');
  console.log('   Run "node scripts/quickEmailTest.js" to test email sending.');
} else {
  console.log('⚠️  CONFIGURATION INCOMPLETE');
  console.log('   Follow the steps above to complete email setup.');
}