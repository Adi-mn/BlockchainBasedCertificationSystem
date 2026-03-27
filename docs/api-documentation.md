start.bat
# API Documentation

## 🔗 Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## 🔑 Authentication Endpoints

### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "organization": "University Name" // Required for institution/verifier
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "isActive": true
  }
}
```

### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "lastLogin": "2023-12-01T10:00:00Z"
  }
}
```

### GET /auth/me
Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "walletAddress": "0x...",
    "createdAt": "2023-11-01T10:00:00Z"
  }
}
```

## 📜 Certificate Endpoints

### POST /certificates
Create a new certificate (Institution only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "studentName": "Jane Smith",
  "studentEmail": "jane@example.com",
  "certificateType": "Bachelor's Degree",
  "courseName": "Computer Science",
  "issueDate": "2023-12-01",
  "expiryDate": "2028-12-01",
  "grade": "First Class",
  "description": "Bachelor of Science in Computer Science",
  "ipfsHash": "QmHash123...",
  "issuerAddress": "0x123...",
  "transactionHash": "0xabc..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate created successfully",
  "certificate": {
    "_id": "cert_id",
    "studentName": "Jane Smith",
    "certificateType": "Bachelor's Degree",
    "blockchainId": "1",
    "isVerified": false,
    "createdAt": "2023-12-01T10:00:00Z"
  }
}
```

### GET /certificates
Get all certificates with pagination (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status
- `certificateType` (string): Filter by type
- `isVerified` (boolean): Filter by verification status

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10,
  "certificates": [
    {
      "_id": "cert_id",
      "studentName": "Jane Smith",
      "certificateType": "Bachelor's Degree",
      "institutionName": "University ABC",
      "isVerified": true,
      "createdAt": "2023-12-01T10:00:00Z"
    }
  ]
}
```

### GET /certificates/institution
Get certificates issued by current institution.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "certificates": [
    {
      "_id": "cert_id",
      "studentName": "Jane Smith",
      "certificateType": "Bachelor's Degree",
      "isVerified": true,
      "createdAt": "2023-12-01T10:00:00Z"
    }
  ]
}
```

### GET /certificates/student
Get certificates for current student.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 3,
  "certificates": [
    {
      "_id": "cert_id",
      "certificateType": "Bachelor's Degree",
      "courseName": "Computer Science",
      "institutionName": "University ABC",
      "issueDate": "2023-12-01",
      "isVerified": true
    }
  ]
}
```

### GET /certificates/:id
Get specific certificate details.

**Response:**
```json
{
  "success": true,
  "certificate": {
    "_id": "cert_id",
    "studentName": "Jane Smith",
    "studentEmail": "jane@example.com",
    "certificateType": "Bachelor's Degree",
    "courseName": "Computer Science",
    "institutionName": "University ABC",
    "issueDate": "2023-12-01",
    "expiryDate": "2028-12-01",
    "grade": "First Class",
    "description": "Bachelor of Science in Computer Science",
    "ipfsHash": "QmHash123...",
    "blockchainId": "1",
    "transactionHash": "0xabc...",
    "isVerified": true,
    "verificationCount": 5,
    "createdAt": "2023-12-01T10:00:00Z"
  }
}
```

### GET /certificates/:id/verify
Verify certificate authenticity.

**Response:**
```json
{
  "success": true,
  "exists": true,
  "verificationResult": "valid",
  "certificate": {
    "_id": "cert_id",
    "studentName": "Jane Smith",
    "certificateType": "Bachelor's Degree",
    "isVerified": true,
    "isRevoked": false,
    "isExpired": false
  },
  "timestamp": "2023-12-01T10:00:00Z"
}
```

### POST /certificates/:id/verify
Mark certificate as verified (Admin/Verifier only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Certificate verified successfully",
  "isValid": true
}
```

### POST /certificates/:id/revoke
Revoke a certificate (Institution/Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "Academic misconduct"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate revoked successfully"
}
```

### GET /certificates/search
Search certificates by various criteria.

**Query Parameters:**
- `q` (string): Search query
- `limit` (number): Max results (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "certificates": [
    {
      "_id": "cert_id",
      "studentName": "Jane Smith",
      "certificateType": "Bachelor's Degree",
      "institutionName": "University ABC",
      "verificationStatus": "valid"
    }
  ]
}
```

## 👨‍💼 Admin Endpoints

### GET /admin/stats
Get system statistics (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "totalUsers": 1000,
  "totalInstitutions": 50,
  "totalCertificates": 5000,
  "totalVerifications": 10000,
  "verifiedCertificates": 4500,
  "pendingCertificates": 500,
  "userBreakdown": {
    "admin": 5,
    "institution": 50,
    "student": 900,
    "verifier": 45
  }
}
```

### GET /admin/users
Get all users with pagination (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `role` (string): Filter by role
- `isActive` (boolean): Filter by status

**Response:**
```json
{
  "success": true,
  "count": 20,
  "total": 1000,
  "users": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "isActive": true,
      "createdAt": "2023-11-01T10:00:00Z"
    }
  ]
}
```

### PATCH /admin/users/:id/status
Update user status (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "isActive": false
  }
}
```

## 🔍 Verifier Endpoints

### GET /verifier/stats
Get verifier statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "totalVerifications": 100,
  "validCertificates": 85,
  "invalidCertificates": 15
}
```

### GET /verifier/recent-verifications
Get recent verification activities.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 10,
  "verifications": [
    {
      "_id": "verification_id",
      "certificateType": "Bachelor's Degree",
      "studentName": "Jane Smith",
      "status": "valid",
      "verifiedAt": "2023-12-01T10:00:00Z"
    }
  ]
}
```

## 📁 IPFS Endpoints

### POST /ipfs/upload
Upload file to IPFS (Institution only).

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
- `file`: PDF file (max 10MB)

**Response:**
```json
{
  "success": true,
  "message": "File uploaded to IPFS successfully",
  "ipfsHash": "QmHash123...",
  "ipfsUrl": "https://gateway.pinata.cloud/ipfs/QmHash123...",
  "fileSize": 1024000,
  "fileName": "certificate.pdf"
}
```

### GET /ipfs/:hash
Get IPFS file information.

**Response:**
```json
{
  "success": true,
  "ipfsHash": "QmHash123...",
  "ipfsUrl": "https://gateway.pinata.cloud/ipfs/QmHash123...",
  "publicGatewayUrl": "https://ipfs.io/ipfs/QmHash123...",
  "metadata": {
    "name": "certificate.pdf",
    "size": 1024000,
    "pinDate": "2023-12-01T10:00:00Z"
  }
}
```

## 📊 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - External service down |

## 🔄 Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **File upload endpoints**: 10 requests per hour per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360000
```

## 📝 Request Examples

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get certificates (with token)
curl -X GET http://localhost:5000/api/certificates/student \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Upload file
curl -X POST http://localhost:5000/api/ipfs/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@certificate.pdf"
```

### Using JavaScript (Axios)

```javascript
// Login
const loginResponse = await axios.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

const token = loginResponse.data.token;

// Get certificates
const certificatesResponse = await axios.get('/api/certificates/student', {
  headers: { Authorization: `Bearer ${token}` }
});

// Upload file
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const uploadResponse = await axios.post('/api/ipfs/upload', formData, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

## 🧪 Testing

Use the provided Postman collection or test with curl commands. All endpoints include comprehensive error handling and validation.

For development, demo accounts are available:
- Admin: admin@demo.com / password123
- Institution: institution@demo.com / password123
- Student: student@demo.com / password123
- Verifier: verifier@demo.com / password123