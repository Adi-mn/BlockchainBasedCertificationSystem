# User Guide

## 🎯 Overview

The Blockchain Certificate Verification System allows institutions to issue tamper-proof digital certificates, students to manage their credentials, and verifiers to instantly authenticate certificates using blockchain technology.

## 👥 User Roles

### 🏛️ Admin
- System administration and user management
- Monitor system statistics and analytics
- Manage smart contract permissions
- Oversee platform operations

### 🎓 Institution
- Issue digital certificates to students
- Upload certificate documents to IPFS
- Generate QR codes for verification
- Manage issued certificates

### 👨‍🎓 Student
- View and download certificates
- Share certificates with employers
- Generate verification QR codes
- Track certificate status

### ✅ Verifier
- Verify certificate authenticity
- Scan QR codes for instant verification
- Search and validate certificates
- Access verification history

## 🚀 Getting Started

### 1. Account Registration

1. Visit the application homepage
2. Click "Sign Up" in the top navigation
3. Fill in your details:
   - **Full Name**: Your complete name
   - **Email**: Valid email address
   - **Password**: Strong password (min 6 characters)
   - **Account Type**: Select your role
   - **Organization**: Required for institutions and verifiers
4. Click "Create Account"
5. You'll be automatically logged in

### 2. MetaMask Setup

1. Install [MetaMask browser extension](https://metamask.io/)
2. Create or import a wallet
3. Add Polygon network:
   - Network Name: Polygon Mainnet
   - RPC URL: https://polygon-rpc.com/
   - Chain ID: 137
   - Currency Symbol: MATIC
   - Block Explorer: https://polygonscan.com/
4. Get some MATIC tokens for transaction fees

### 3. Connect Wallet

1. Click "Connect Wallet" in the navigation
2. Select MetaMask from the options
3. Approve the connection request
4. Your wallet address will be displayed

## 🏛️ Institution Guide

### Issuing Certificates

#### Step 1: Access Upload Form
1. Log in to your institution account
2. Navigate to "Upload Certificate" or click the upload button
3. Ensure your wallet is connected

#### Step 2: Fill Student Information
- **Student Name**: Full name as it should appear on certificate
- **Student Email**: Valid email address of the student

#### Step 3: Certificate Details
- **Certificate Type**: Select from dropdown (Degree, Diploma, etc.)
- **Course/Program Name**: Full name of the course or program
- **Issue Date**: When the certificate was issued
- **Expiry Date**: Optional expiration date
- **Grade/Score**: Optional grade or score achieved
- **Description**: Additional details about the certificate

#### Step 4: Upload Certificate File
1. Click "Choose File" or drag and drop
2. Select a PDF file (max 10MB)
3. Wait for upload confirmation
4. The file will be stored on IPFS

#### Step 5: Blockchain Submission
1. Review all information carefully
2. Click "Upload Certificate"
3. Approve the MetaMask transaction
4. Wait for blockchain confirmation
5. Certificate is now issued and verifiable

### Managing Certificates

#### View Issued Certificates
1. Go to "Institution Dashboard"
2. See all certificates you've issued
3. Filter by status, type, or date
4. Click on any certificate to view details

#### Generate QR Codes
1. Click the QR code icon next to any certificate
2. Download the QR code image
3. Share with students or include in documents
4. QR codes contain verification URLs

#### Certificate Actions
- **View**: See full certificate details
- **Generate QR**: Create verification QR code
- **Revoke**: Cancel a certificate (if needed)

### Dashboard Statistics
- **Total Certificates**: Number of certificates issued
- **Students**: Unique students with certificates
- **This Month**: Recent certificate activity
- **Verification Stats**: How often certificates are verified

## 👨‍🎓 Student Guide

### Viewing Your Certificates

#### Access Your Dashboard
1. Log in to your student account
2. Go to "Student Dashboard"
3. See all certificates issued to your email

#### Certificate Information
Each certificate shows:
- **Certificate Type**: Degree, diploma, etc.
- **Course/Program**: What you studied
- **Institution**: Who issued it
- **Issue Date**: When it was issued
- **Status**: Verified or pending
- **Grade**: If applicable

### Managing Certificates

#### Download Certificates
1. Click the download icon on any certificate
2. The original PDF will be downloaded
3. Files are retrieved from IPFS storage

#### Share Certificates
1. Click "View" on any certificate
2. Copy the verification URL
3. Share the URL with employers or others
4. Generate QR codes for easy sharing

#### Generate QR Codes
1. Click the QR code icon
2. Download the QR code image
3. Include in resumes or applications
4. Anyone can scan to verify authenticity

### Certificate Status

#### Status Types
- **Pending**: Recently issued, awaiting verification
- **Verified**: Confirmed authentic by the system
- **Expired**: Past expiration date (if applicable)
- **Revoked**: Cancelled by the institution

#### Verification Count
- See how many times your certificate has been verified
- Track employer verification activity
- Monitor certificate usage

## ✅ Verifier Guide

### Verifying Certificates

#### QR Code Scanning
1. Go to "QR Scanner" page
2. Allow camera access
3. Point camera at QR code
4. Automatic verification results
5. View certificate details

#### Manual Search
1. Go to "Verifier Dashboard"
2. Use the search function
3. Enter student name, email, or certificate ID
4. Review search results
5. Click "Verify" on any certificate

#### Upload QR Image
1. Go to "QR Scanner" page
2. Click "Upload Image"
3. Select QR code image file
4. Automatic verification

### Verification Results

#### Valid Certificate
- ✅ Green checkmark
- "Certificate Verified"
- Full certificate details displayed
- Blockchain confirmation

#### Invalid Certificate
- ❌ Red X mark
- "Certificate Invalid"
- Reason for invalidity
- Verification timestamp

#### Expired Certificate
- ⚠️ Yellow warning
- "Certificate Expired"
- Original issue and expiry dates
- Still shows as authentic but expired

#### Revoked Certificate
- ❌ Red X mark
- "Certificate Revoked"
- Revocation reason
- Date of revocation

### Verification History

#### Access History
1. Go to "Verifier Dashboard"
2. Click "History" or view recent verifications
3. See all your verification activities

#### History Details
- **Certificate Type**: What was verified
- **Student Name**: Who the certificate belongs to
- **Verification Result**: Valid, invalid, expired, etc.
- **Date/Time**: When verification occurred
- **Method**: QR scan, manual search, etc.

### Analytics

#### Verification Statistics
- **Total Verifications**: How many you've performed
- **Valid Certificates**: Successful verifications
- **Invalid Certificates**: Failed verifications
- **Success Rate**: Percentage of valid certificates

#### Trends and Patterns
- Daily verification activity
- Most common certificate types
- Institution verification patterns
- Geographic verification data

## 👨‍💼 Admin Guide

### User Management

#### View All Users
1. Go to "Admin Dashboard"
2. Click "User Management"
3. See all registered users
4. Filter by role, status, or date

#### User Actions
- **Activate/Deactivate**: Enable or disable user accounts
- **View Details**: See user information and activity
- **Delete User**: Remove user account (careful!)
- **Change Role**: Modify user permissions

#### Bulk Operations
- Export user data
- Send notifications
- Bulk status changes
- Generate reports

### System Statistics

#### Dashboard Overview
- **Total Users**: All registered users
- **Total Institutions**: Active institutions
- **Total Certificates**: All issued certificates
- **Total Verifications**: All verification attempts

#### Detailed Analytics
- User registration trends
- Certificate issuance patterns
- Verification success rates
- Geographic distribution
- Popular certificate types

### Smart Contract Management

#### Contract Permissions
1. Access smart contract admin functions
2. Add new institutions as issuers
3. Grant verifier permissions
4. Manage admin roles

#### Contract Monitoring
- Monitor blockchain transactions
- Track gas usage and costs
- View contract events
- System health checks

### System Health

#### Monitoring Dashboard
- API response times
- Database performance
- IPFS availability
- Blockchain connectivity
- Error rates and logs

#### Maintenance Tasks
- Database cleanup
- Log rotation
- Performance optimization
- Security updates

## 🔧 Troubleshooting

### Common Issues

#### Can't Connect Wallet
1. Ensure MetaMask is installed
2. Check you're on the correct network
3. Refresh the page
4. Clear browser cache
5. Try a different browser

#### Certificate Upload Fails
1. Check file is PDF format
2. Ensure file is under 10MB
3. Verify wallet has MATIC for gas
4. Check internet connection
5. Try again after a few minutes

#### QR Code Won't Scan
1. Ensure good lighting
2. Hold camera steady
3. Try uploading QR image instead
4. Check QR code isn't damaged
5. Use manual verification

#### Verification Shows Invalid
1. Check certificate hasn't been revoked
2. Verify certificate hasn't expired
3. Ensure QR code is from our system
4. Contact the issuing institution
5. Try manual search verification

### Getting Help

#### Support Channels
- **Email Support**: support@certverify.com
- **Help Documentation**: Available in app
- **FAQ Section**: Common questions answered
- **Video Tutorials**: Step-by-step guides

#### Reporting Issues
1. Describe the problem clearly
2. Include screenshots if helpful
3. Mention your browser and device
4. Provide error messages
5. Include steps to reproduce

## 🔒 Security Best Practices

### Account Security
- Use strong, unique passwords
- Enable two-factor authentication (when available)
- Don't share login credentials
- Log out from shared computers
- Keep contact information updated

### Wallet Security
- Never share private keys
- Use hardware wallets for large amounts
- Keep seed phrases secure and offline
- Verify transaction details before signing
- Use reputable wallet software

### Certificate Security
- Verify certificates through official channels
- Don't trust screenshots or copies
- Always use QR codes or verification URLs
- Report suspicious certificates
- Keep original documents safe

## 📱 Mobile Usage

### Mobile Browser Support
- Works on all modern mobile browsers
- Responsive design adapts to screen size
- Touch-friendly interface
- Camera access for QR scanning

### Mobile Wallet Integration
- MetaMask mobile app supported
- WalletConnect integration
- Trust Wallet compatibility
- Coinbase Wallet support

### QR Code Scanning
- Use device camera for scanning
- Good lighting improves accuracy
- Hold device steady
- Alternative upload option available

## 🌐 Browser Compatibility

### Supported Browsers
- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Opera**: Full support

### Required Features
- JavaScript enabled
- Local storage access
- Camera access (for QR scanning)
- Web3 wallet extension

## 📞 Contact Information

### Technical Support
- **Email**: tech-support@certverify.com
- **Response Time**: 24-48 hours
- **Available**: Monday-Friday, 9 AM - 5 PM UTC

### Business Inquiries
- **Email**: business@certverify.com
- **Phone**: +1-555-CERT-VERIFY
- **Available**: Monday-Friday, 9 AM - 6 PM UTC

### Emergency Issues
- **Email**: emergency@certverify.com
- **Response Time**: 2-4 hours
- **Available**: 24/7 for critical issues

This user guide provides comprehensive instructions for all user types to effectively use the blockchain certificate verification system.