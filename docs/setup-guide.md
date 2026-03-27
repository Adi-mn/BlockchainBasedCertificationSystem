# Blockchain Certificate Verification System - Setup Guide

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- MetaMask browser extension
- MongoDB (local or cloud)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/blockchain-certificate-verification.git
cd blockchain-certificate-verification
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all project dependencies
npm run install-all
```

### 3. Environment Setup

#### Backend Environment (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/certificate-verification

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# IPFS/Pinata
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Blockchain
BLOCKCHAIN_RPC_URL=https://polygon-rpc.com/
CONTRACT_ADDRESS=your_deployed_contract_address
PRIVATE_KEY=your_private_key_for_blockchain_operations

# CORS
FRONTEND_URL=http://localhost:3000
```

#### Frontend Environment (.env)
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
REACT_APP_PINATA_API_KEY=your_pinata_api_key
REACT_APP_PINATA_SECRET_KEY=your_pinata_secret_key
```

#### Smart Contracts Environment (.env)
```bash
cd smart-contracts
cp .env.example .env
```

Edit `smart-contracts/.env`:
```env
PRIVATE_KEY=your_private_key_without_0x_prefix
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
POLYGON_RPC_URL=https://polygon-rpc.com/
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

### 4. Database Setup

#### Local MongoDB
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in backend/.env

### 5. IPFS Setup (Pinata)

1. Create account at [Pinata](https://pinata.cloud/)
2. Generate API keys
3. Update environment variables with your keys

### 6. Smart Contract Deployment

#### Local Development (Hardhat Network)
```bash
cd smart-contracts

# Start local blockchain
npx hardhat node

# Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

#### Polygon Mumbai Testnet
```bash
cd smart-contracts

# Get test MATIC from faucet
# https://faucet.polygon.technology/

# Deploy to Mumbai
npx hardhat run scripts/deploy.js --network mumbai

# Verify contract
npx hardhat verify --network mumbai YOUR_CONTRACT_ADDRESS
```

#### Polygon Mainnet
```bash
cd smart-contracts

# Deploy to Polygon
npx hardhat run scripts/deploy.js --network polygon

# Verify contract
npx hardhat verify --network polygon YOUR_CONTRACT_ADDRESS
```

### 7. Update Contract Address

After deployment, update the contract address in:
- `backend/.env` → `CONTRACT_ADDRESS`
- `frontend/.env` → `REACT_APP_CONTRACT_ADDRESS`

### 8. Start the Application

#### Development Mode
```bash
# Start all services
npm run dev

# Or start individually:

# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm start
```

#### Production Mode
```bash
# Build frontend
cd frontend && npm run build

# Start backend
cd backend && npm start
```

## 🔧 Configuration

### MetaMask Setup

1. Install MetaMask browser extension
2. Add Polygon network:
   - Network Name: Polygon Mainnet
   - RPC URL: https://polygon-rpc.com/
   - Chain ID: 137
   - Currency Symbol: MATIC
   - Block Explorer: https://polygonscan.com/

3. For Mumbai testnet:
   - Network Name: Mumbai Testnet
   - RPC URL: https://rpc-mumbai.maticvigil.com
   - Chain ID: 80001
   - Currency Symbol: MATIC
   - Block Explorer: https://mumbai.polygonscan.com/

### Demo Accounts

The system comes with pre-configured demo accounts:

- **Admin**: admin@demo.com / password123
- **Institution**: institution@demo.com / password123
- **Student**: student@demo.com / password123
- **Verifier**: verifier@demo.com / password123

## 🧪 Testing

### Smart Contract Tests
```bash
cd smart-contracts
npm test
```

### Backend API Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📱 Usage

### For Institutions

1. Sign up with institution role
2. Connect MetaMask wallet
3. Upload certificate PDFs
4. Fill certificate details
5. Submit to blockchain and IPFS
6. Generate QR codes for verification

### For Students

1. Sign up with student role
2. View issued certificates
3. Download certificates
4. Share QR codes for verification

### For Verifiers

1. Sign up with verifier role
2. Scan QR codes or search certificates
3. Verify authenticity on blockchain
4. View verification history

### For Admins

1. Manage users and roles
2. View system statistics
3. Monitor verification activities
4. Manage smart contract permissions

## 🔍 Troubleshooting

### Common Issues

#### 1. Contract Deployment Fails
- Check you have enough MATIC for gas fees
- Verify RPC URL is correct
- Ensure private key is valid

#### 2. IPFS Upload Fails
- Verify Pinata API keys
- Check file size (max 10MB)
- Ensure file is PDF format

#### 3. Database Connection Error
- Check MongoDB is running
- Verify connection string
- Check network connectivity

#### 4. MetaMask Connection Issues
- Refresh page and reconnect
- Check network is correct
- Clear browser cache

#### 5. API Errors
- Check backend is running
- Verify environment variables
- Check CORS settings

### Getting Help

1. Check the logs in browser console and terminal
2. Verify all environment variables are set
3. Ensure all services are running
4. Check network connectivity

## 🚀 Deployment

### Backend Deployment (Railway/Render)

1. Create account on Railway or Render
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)

1. Create account on Vercel or Netlify
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set environment variables
5. Deploy

### Smart Contract Deployment

Follow the smart contract deployment steps above for your target network.

## 📊 Monitoring

### System Health
- Monitor API endpoints: `/api/health`
- Check database connectivity
- Monitor smart contract events
- Track IPFS availability

### Analytics
- User registration trends
- Certificate issuance statistics
- Verification activity
- System performance metrics

## 🔒 Security

### Best Practices
- Use strong JWT secrets
- Implement rate limiting
- Validate all inputs
- Use HTTPS in production
- Regular security audits
- Keep dependencies updated

### Smart Contract Security
- Role-based access control
- Reentrancy protection
- Pause functionality
- Input validation
- Gas optimization

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Polygon Documentation](https://docs.polygon.technology/)
- [IPFS Documentation](https://docs.ipfs.io/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.