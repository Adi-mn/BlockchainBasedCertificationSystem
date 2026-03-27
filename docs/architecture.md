# System Architecture Documentation

## 🏗️ Overview

The Blockchain Certificate Verification System is a decentralized application that combines traditional web technologies with blockchain and IPFS for secure, immutable certificate management.

## 📊 Architecture Diagrams

### System Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Blockchain    │
│   (React.js)    │◄──►│   (Node.js)     │◄──►│   (Polygon)     │
│                 │    │                 │    │                 │
│ • User Interface│    │ • REST APIs     │    │ • Smart Contract│
│ • Web3 Integration│  │ • Authentication│    │ • Certificate   │
│ • QR Generation │    │ • File Upload   │    │   Storage       │
│ • Certificate   │    │ • Validation    │    │ • Verification  │
│   Viewer        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     IPFS        │    │    Database     │    │   External      │
│   (Pinata)      │    │   (MongoDB)     │    │   Services      │
│                 │    │                 │    │                 │
│ • File Storage  │    │ • User Data     │    │ • Email Service │
│ • Decentralized │    │ • Metadata      │    │ • Analytics     │
│ • Immutable     │    │ • Logs          │    │ • Monitoring    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow Diagram
```
[Institution] → [Upload Certificate] → [IPFS Storage] → [Blockchain Record]
     │                    │                  │               │
     ▼                    ▼                  ▼               ▼
[Database] ← [Backend API] ← [Frontend] ← [Smart Contract]
     │                    │                  │               │
     ▼                    ▼                  ▼               ▼
[Student] ← [Verification] ← [QR Scanner] ← [Verifier]
```

### Component Interaction Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Auth Context  │  Web3 Context   │    UI Components        │
│                 │                 │                         │
│ • Login/Signup  │ • Wallet Conn.  │ • Dashboards           │
│ • JWT Tokens    │ • Contract Int. │ • Forms                │
│ • User State    │ • Blockchain    │ • QR Scanner/Generator │
└─────────────────┴─────────────────┴─────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Layer                            │
├─────────────────┬─────────────────┬─────────────────────────┤
│   Auth Routes   │  Certificate    │    Admin Routes         │
│                 │    Routes       │                         │
│ • Login/Signup  │ • CRUD Ops      │ • User Management      │
│ • JWT Auth      │ • Verification  │ • System Stats         │
│ • Role Check    │ • File Upload   │ • Analytics            │
└─────────────────┴─────────────────┴─────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                │
├─────────────────┬─────────────────┬─────────────────────────┤
│    MongoDB      │      IPFS       │     Blockchain          │
│                 │                 │                         │
│ • User Data     │ • File Storage  │ • Certificate Records  │
│ • Metadata      │ • Decentralized │ • Immutable Storage    │
│ • Logs          │ • Content Hash  │ • Smart Contracts      │
└─────────────────┴─────────────────┴─────────────────────────┘
```

## 🔧 Technology Stack

### Frontend
- **Framework**: React.js 18
- **Styling**: Tailwind CSS
- **State Management**: Context API
- **Blockchain**: Ethers.js
- **QR Code**: qrcode, qr-scanner
- **HTTP Client**: Axios
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Upload**: Multer
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

### Blockchain
- **Network**: Polygon (MATIC)
- **Smart Contract**: Solidity 0.8.19
- **Development**: Hardhat
- **Libraries**: OpenZeppelin
- **Testing**: Hardhat, Chai

### Storage
- **Database**: MongoDB
- **File Storage**: IPFS via Pinata
- **Caching**: In-memory (extensible to Redis)

## 🏛️ System Components

### 1. Frontend Application

#### Authentication System
```javascript
// Auth Context manages user state and authentication
const AuthContext = {
  user: User | null,
  login: (email, password) => Promise<AuthResult>,
  signup: (userData) => Promise<AuthResult>,
  logout: () => void
}
```

#### Web3 Integration
```javascript
// Web3 Context manages blockchain interactions
const Web3Context = {
  provider: Web3Provider,
  signer: Signer,
  contract: Contract,
  account: string,
  connectWallet: () => Promise<boolean>
}
```

#### Role-Based Dashboards
- **Admin Dashboard**: User management, system statistics
- **Institution Dashboard**: Certificate issuance, management
- **Student Dashboard**: Certificate viewing, downloading
- **Verifier Dashboard**: Certificate verification, search

### 2. Backend API

#### Authentication Layer
```javascript
// JWT-based authentication with role-based access
middleware: [
  protect,           // Verify JWT token
  authorize(roles),  // Check user roles
  rateLimit,        // Prevent abuse
  validate          // Input validation
]
```

#### API Routes
```
/api/auth/*          - Authentication endpoints
/api/certificates/*  - Certificate CRUD operations
/api/admin/*         - Admin management endpoints
/api/verifier/*      - Verification endpoints
/api/ipfs/*          - IPFS file operations
```

#### Data Models
```javascript
// User Model
User: {
  name, email, password, role, organization,
  walletAddress, isActive, isVerified
}

// Certificate Model
Certificate: {
  studentName, studentEmail, certificateType,
  courseName, institutionId, issueDate, expiryDate,
  blockchainId, transactionHash, ipfsHash,
  isVerified, isRevoked
}

// Verification Log Model
VerificationLog: {
  certificateId, verifierId, verifierIP,
  verificationMethod, verificationResult,
  responseTime, location
}
```

### 3. Smart Contract

#### Contract Structure
```solidity
contract CertificateVerification {
    // Roles
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Certificate struct
    struct Certificate {
        uint256 id;
        address issuer;
        string studentEmail;
        string certificateType;
        string ipfsHash;
        uint256 issueDate;
        uint256 expiryDate;
        bool isValid;
        bool isRevoked;
    }
    
    // Main functions
    function issueCertificate(...) external returns (uint256);
    function verifyCertificate(uint256) external returns (bool);
    function revokeCertificate(uint256, string) external;
}
```

## 🔄 Process Flows

### Certificate Issuance Flow
```
1. Institution logs in → 2. Uploads PDF file → 3. File stored in IPFS
                                                        ↓
8. Database updated ← 7. Transaction confirmed ← 4. IPFS hash returned
        ↓                        ↑                        ↓
9. QR code generated ← 6. Smart contract call ← 5. Form submission
```

### Certificate Verification Flow
```
1. QR code scanned → 2. Certificate ID extracted → 3. Database lookup
                                                           ↓
6. Result displayed ← 5. Verification logged ← 4. Blockchain verification
```

### User Authentication Flow
```
1. User submits credentials → 2. Backend validates → 3. JWT token generated
                                        ↓                      ↓
7. Protected routes accessible ← 6. Token stored ← 4. User data returned
                                        ↑                      ↓
8. Automatic token refresh ← 5. Frontend updates state
```

## 🔐 Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **Role-Based Access**: Admin, Institution, Student, Verifier
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all inputs
- **CORS Protection**: Restrict cross-origin requests

### Blockchain Security
- **Access Control**: Role-based smart contract permissions
- **Reentrancy Protection**: Prevent recursive calls
- **Pause Mechanism**: Emergency stop functionality
- **Input Validation**: Solidity-level checks
- **Gas Optimization**: Efficient contract operations

### Data Security
- **Password Hashing**: bcrypt with salt
- **HTTPS Only**: Encrypted data transmission
- **Environment Variables**: Secure configuration
- **Database Security**: Connection encryption
- **File Validation**: PDF-only uploads

## 📈 Scalability Considerations

### Horizontal Scaling
- **Load Balancers**: Distribute traffic across instances
- **Database Sharding**: Partition data across servers
- **CDN Integration**: Cache static assets
- **Microservices**: Split into smaller services

### Blockchain Scaling
- **Layer 2 Solutions**: Polygon for lower fees
- **Batch Operations**: Multiple certificates per transaction
- **Event Indexing**: Efficient data retrieval
- **State Channels**: Off-chain interactions

### Performance Optimization
- **Database Indexing**: Optimize query performance
- **Caching Strategy**: Redis for frequent data
- **Image Optimization**: Compress and resize
- **Code Splitting**: Lazy load components

## 🔍 Monitoring & Analytics

### System Monitoring
- **Health Checks**: API endpoint monitoring
- **Error Tracking**: Centralized error logging
- **Performance Metrics**: Response time tracking
- **Resource Usage**: CPU, memory, disk monitoring

### Business Analytics
- **User Activity**: Registration and usage patterns
- **Certificate Statistics**: Issuance and verification trends
- **Verification Analytics**: Success rates and methods
- **Geographic Distribution**: User location data

### Blockchain Analytics
- **Transaction Monitoring**: Gas usage and costs
- **Contract Events**: Certificate lifecycle tracking
- **Network Health**: Block time and congestion
- **Smart Contract Metrics**: Function call statistics

## 🚀 Deployment Architecture

### Development Environment
```
Local Machine:
├── Frontend (localhost:3000)
├── Backend (localhost:5000)
├── MongoDB (localhost:27017)
├── Hardhat Network (localhost:8545)
└── IPFS (Pinata API)
```

### Production Environment
```
Cloud Infrastructure:
├── Frontend (Vercel/Netlify)
├── Backend (Railway/Render/AWS)
├── Database (MongoDB Atlas)
├── Blockchain (Polygon Mainnet)
└── Storage (Pinata/Web3.Storage)
```

### CI/CD Pipeline
```
GitHub → Build & Test → Deploy to Staging → Manual Approval → Production Deploy
   ↓           ↓              ↓                    ↓              ↓
Code Push → Unit Tests → Integration Tests → QA Review → Live System
```

## 🔧 Configuration Management

### Environment Variables
- **Development**: Local .env files
- **Staging**: Platform environment settings
- **Production**: Secure secret management
- **Smart Contracts**: Network-specific configs

### Feature Flags
- **A/B Testing**: Gradual feature rollout
- **Emergency Switches**: Quick feature disable
- **User Segments**: Role-based features
- **Performance Toggles**: Resource optimization

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/signup     - User registration
POST /api/auth/login      - User login
GET  /api/auth/me         - Get current user
PUT  /api/auth/profile    - Update profile
POST /api/auth/logout     - User logout
```

### Certificate Endpoints
```
POST /api/certificates              - Create certificate
GET  /api/certificates              - List certificates
GET  /api/certificates/:id          - Get certificate
PUT  /api/certificates/:id          - Update certificate
GET  /api/certificates/:id/verify   - Verify certificate
POST /api/certificates/:id/revoke   - Revoke certificate
```

### Admin Endpoints
```
GET  /api/admin/stats               - System statistics
GET  /api/admin/users               - List users
PATCH /api/admin/users/:id/status   - Update user status
GET  /api/admin/analytics/*         - Various analytics
```

This architecture provides a robust, scalable, and secure foundation for the blockchain certificate verification system, ensuring data integrity, user privacy, and system reliability.