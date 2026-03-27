# Deployment Guide

## 🚀 Production Deployment

This guide covers deploying the Blockchain Certificate Verification System to production environments.

## 📋 Prerequisites

- Domain name and SSL certificate
- Cloud hosting accounts (Vercel, Railway, MongoDB Atlas)
- Blockchain network access (Polygon mainnet)
- IPFS service (Pinata account)
- Email service (optional)

## 🌐 Frontend Deployment (Vercel)

### 1. Prepare for Deployment

```bash
cd frontend

# Build the application
npm run build

# Test the build locally
npm install -g serve
serve -s build
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: GitHub Integration
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 3. Environment Variables

Set these environment variables in Vercel dashboard:

```env
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key
```

### 4. Custom Domain

1. Go to Vercel project settings
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate will be automatically provisioned

## 🖥️ Backend Deployment (Railway)

### 1. Prepare for Deployment

```bash
cd backend

# Ensure all dependencies are listed
npm install

# Test production build
NODE_ENV=production npm start
```

### 2. Deploy to Railway

#### Option A: Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### Option B: GitHub Integration
1. Connect GitHub repository to Railway
2. Select the backend directory as root
3. Railway will auto-detect Node.js and deploy

### 3. Environment Variables

Set these in Railway dashboard:

```env
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/certificate-verification

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=30d

# IPFS/Pinata
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt_token

# Blockchain
BLOCKCHAIN_RPC_URL=https://polygon-rpc.com/
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
PRIVATE_KEY=your_private_key_for_blockchain_operations

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Custom Domain

1. Add custom domain in Railway settings
2. Configure DNS CNAME record
3. SSL certificate will be automatically provisioned

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Cluster

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (M0 free tier for testing)
3. Choose cloud provider and region
4. Create database user with read/write permissions
5. Configure network access (allow all IPs: 0.0.0.0/0 for simplicity)

### 2. Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with your database name

### 3. Database Indexes

Connect to your database and create indexes for better performance:

```javascript
// Connect to MongoDB
use certificate-verification

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.certificates.createIndex({ studentEmail: 1 })
db.certificates.createIndex({ institutionId: 1 })
db.certificates.createIndex({ blockchainId: 1 }, { unique: true, sparse: true })
db.certificates.createIndex({ transactionHash: 1 }, { unique: true, sparse: true })
db.certificates.createIndex({ ipfsHash: 1 })
db.certificates.createIndex({ createdAt: -1 })
db.verificationlogs.createIndex({ certificateId: 1 })
db.verificationlogs.createIndex({ createdAt: -1 })
```

## ⛓️ Smart Contract Deployment

### 1. Deploy to Polygon Mainnet

```bash
cd smart-contracts

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your values

# Compile contracts
npx hardhat compile

# Deploy to Polygon
npx hardhat run scripts/deploy.js --network polygon
```

### 2. Verify Contract

```bash
# Verify on Polygonscan
npx hardhat verify --network polygon YOUR_CONTRACT_ADDRESS

# Example
npx hardhat verify --network polygon 0x1234567890123456789012345678901234567890
```

### 3. Set Up Contract Permissions

After deployment, set up the necessary roles:

```javascript
// Connect to your deployed contract and run these transactions
// Grant ISSUER_ROLE to institution addresses
await contract.addIssuer("0xInstitutionAddress1");
await contract.addIssuer("0xInstitutionAddress2");

// Grant VERIFIER_ROLE to verifier addresses
await contract.addVerifier("0xVerifierAddress1");
await contract.addVerifier("0xVerifierAddress2");
```

## 📁 IPFS Setup (Pinata)

### 1. Create Pinata Account

1. Sign up at [Pinata](https://pinata.cloud/)
2. Verify your email address
3. Choose a plan (free tier available)

### 2. Generate API Keys

1. Go to API Keys section
2. Create new API key with permissions:
   - `pinFileToIPFS`
   - `pinByHash`
   - `unpin`
   - `userPinPolicy`
3. Save the API Key and Secret Key

### 3. Configure Pinning Policy (Optional)

Set up automatic unpinning for old files to manage storage:

```javascript
// Example pinning policy
{
  "regions": [
    {
      "id": "FRA1",
      "desiredReplicationCount": 1
    }
  ],
  "version": 1
}
```

## 🔧 Alternative Deployment Options

### Backend Alternatives

#### Render
```bash
# Similar to Railway
# Connect GitHub repository
# Set environment variables
# Deploy automatically
```

#### AWS EC2
```bash
# Launch EC2 instance
# Install Node.js and PM2
# Clone repository
# Set environment variables
# Start with PM2
pm2 start server.js --name certificate-backend
pm2 startup
pm2 save
```

#### DigitalOcean App Platform
```bash
# Connect GitHub repository
# Configure build and run commands
# Set environment variables
# Deploy
```

### Frontend Alternatives

#### Netlify
```bash
# Connect GitHub repository
# Build command: npm run build
# Publish directory: build
# Set environment variables
```

#### AWS S3 + CloudFront
```bash
# Build the application
npm run build

# Upload to S3 bucket
aws s3 sync build/ s3://your-bucket-name

# Configure CloudFront distribution
# Set up custom domain and SSL
```

## 🔒 Security Checklist

### Environment Security
- [ ] Use strong, unique JWT secrets
- [ ] Enable HTTPS everywhere
- [ ] Set secure CORS policies
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerts

### Database Security
- [ ] Use strong database passwords
- [ ] Enable database encryption
- [ ] Restrict network access
- [ ] Regular backups
- [ ] Monitor database access

### Smart Contract Security
- [ ] Verify contract source code
- [ ] Set up proper access controls
- [ ] Monitor contract events
- [ ] Keep private keys secure
- [ ] Use multi-signature wallets for admin functions

## 📊 Monitoring Setup

### Application Monitoring

#### Sentry (Error Tracking)
```bash
# Install Sentry
npm install @sentry/node @sentry/react

# Configure in backend
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "YOUR_SENTRY_DSN" });

# Configure in frontend
import * as Sentry from "@sentry/react";
Sentry.init({ dsn: "YOUR_SENTRY_DSN" });
```

#### LogRocket (Session Replay)
```bash
# Install LogRocket
npm install logrocket

# Configure
import LogRocket from 'logrocket';
LogRocket.init('your-app-id');
```

### Infrastructure Monitoring

#### Uptime Monitoring
- Use services like Pingdom, UptimeRobot, or StatusCake
- Monitor API endpoints and frontend availability
- Set up alerts for downtime

#### Performance Monitoring
- Monitor response times
- Track error rates
- Monitor resource usage
- Set up alerts for performance degradation

## 🚀 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      # Test backend
      - name: Test Backend
        run: |
          cd backend
          npm install
          npm test
      
      # Test frontend
      - name: Test Frontend
        run: |
          cd frontend
          npm install
          npm test
      
      # Test smart contracts
      - name: Test Smart Contracts
        run: |
          cd smart-contracts
          npm install
          npx hardhat test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend
```

## 🔄 Backup Strategy

### Database Backups
```bash
# MongoDB Atlas automatic backups are enabled by default
# For additional backups, use mongodump
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/certificate-verification"
```

### Code Backups
- Use Git with multiple remotes (GitHub, GitLab, Bitbucket)
- Regular repository backups
- Tag releases for easy rollback

### Smart Contract Backups
- Keep deployment artifacts
- Backup private keys securely
- Document contract addresses and ABIs

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancers for backend
- Implement database sharding
- Use CDN for static assets
- Consider microservices architecture

### Performance Optimization
- Implement caching (Redis)
- Optimize database queries
- Use connection pooling
- Compress responses

### Cost Optimization
- Monitor resource usage
- Use auto-scaling
- Optimize database operations
- Consider serverless functions for specific tasks

## 🆘 Troubleshooting

### Common Issues

#### Deployment Fails
- Check build logs for errors
- Verify environment variables
- Ensure all dependencies are installed
- Check for syntax errors

#### Database Connection Issues
- Verify connection string
- Check network access settings
- Ensure database user has correct permissions
- Test connection locally

#### Smart Contract Issues
- Verify contract address is correct
- Check network configuration
- Ensure sufficient gas fees
- Verify ABI matches deployed contract

#### IPFS Upload Fails
- Check Pinata API keys
- Verify file size limits
- Check network connectivity
- Ensure file format is supported

This deployment guide provides a comprehensive approach to deploying your blockchain certificate verification system to production environments with proper security, monitoring, and scaling considerations.