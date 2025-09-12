# BDS PRO Payment System Documentation

## Overview
The BDS PRO payment system is a comprehensive cryptocurrency payment solution that supports USDT deposits and withdrawals through both ERC20 (Ethereum) and TRC20 (TRON) networks.

## Features

### 🚀 Core Functionality
- **USDT Deposits**: Support for both ERC20 and TRC20 networks
- **USDT Withdrawals**: Secure withdrawal to user-specified wallet addresses
- **QR Code Generation**: Automatic QR code generation for easy payments
- **Blockchain Monitoring**: Real-time blockchain transaction monitoring
- **Payment History**: Complete transaction history tracking
- **Status Management**: Real-time payment status updates

### 💰 Supported Payment Methods
1. **USDT (ERC20)**
   - Network: Ethereum
   - Wallet: `0xdfca28ad998742570aecb7ffde1fe564b7d42c30`
   - Min Amount: 50 USDT
   - Est. Time: 5-15 minutes
   - Fees: 0

2. **USDT (TRC20)**
   - Network: TRON
   - Wallet: `TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt`
   - Min Amount: 50 USDT
   - Est. Time: 1-3 minutes
   - Fees: 0

## Technical Architecture

### Backend Components

#### 1. Database Models
- **Payment Model** (`models/Payment.js`)
  - MongoDB schema for payment records
  - Fields: userId, amount, currency, wallet, txHash, status, qrCode, orderId, expiresAt
  - Indexes for performance optimization

#### 2. Blockchain Watcher Service
- **File**: `services/blockchainWatcher.js`
- **Features**:
  - Ethereum (ERC20) transaction monitoring using Ethers.js
  - TRON (TRC20) transaction monitoring using TronWeb
  - Automatic payment confirmation
  - QR code generation
  - Real-time blockchain polling (30-second intervals)

#### 3. Payment Controller
- **File**: `controllers/paymentController.js`
- **Endpoints**:
  - `POST /api/payments/create` - Create new payment order
  - `GET /api/payments/status/:id` - Check payment status
  - `GET /api/payments/history/:userId` - Get payment history
  - `GET /api/payments/methods` - Get supported payment methods
  - `POST /api/payments/withdraw` - Create withdrawal request
  - `GET /api/payments/withdrawals/:userId` - Get withdrawal history

#### 4. API Routes
- **File**: `routes/payments.js`
- **Authentication**: JWT token required for all endpoints
- **Rate Limiting**: Built-in rate limiting protection

### Frontend Components

#### 1. My Account Page
- **File**: `pages/MyAccount.js`
- **Features**:
  - Deposit form with payment method selection
  - Withdrawal form with wallet address input
  - Payment history table
  - Withdrawal history table
  - QR code display for deposits
  - Real-time status updates

#### 2. Navigation Integration
- **Dashboard Integration**: My Account accessible from sidebar
- **Routing**: `/my-account` route with authentication protection

## API Endpoints

### Payment Creation
```http
POST /api/payments/create
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 100,
  "currency": "USDT-ERC20",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment order created successfully",
  "data": {
    "orderId": "PAY_1703123456_ABC12345",
    "amount": 100,
    "currency": "USDT-ERC20",
    "wallet": "0xdfca28ad998742570aecb7ffde1fe564b7d42c30",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "expiresAt": "2023-12-21T10:30:00.000Z",
    "status": "pending"
  }
}
```

### Payment Status Check
```http
GET /api/payments/status/PAY_1703123456_ABC12345
Authorization: Bearer <jwt_token>
```

### Withdrawal Creation
```http
POST /api/payments/withdraw
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 50,
  "currency": "USDT-TRC20",
  "walletAddress": "TUserWalletAddress123456789",
  "userId": "user123"
}
```

## Database Schema

### Payment Collection
```javascript
{
  _id: ObjectId,
  userId: String,           // User identifier
  amount: Number,           // Payment amount in USDT
  currency: String,         // "USDT-ERC20" or "USDT-TRC20"
  wallet: String,           // Wallet address (deposit: system wallet, withdrawal: user wallet)
  txHash: String,           // Blockchain transaction hash
  status: String,           // "pending", "paid", "failed", "expired"
  qrCode: String,           // Base64 encoded QR code
  orderId: String,          // Unique order identifier
  expiresAt: Date,          // Payment expiration time
  createdAt: Date,          // Creation timestamp
  updatedAt: Date,          // Last update timestamp
  confirmedAt: Date         // Payment confirmation timestamp
}
```

## Environment Variables

### Required Environment Variables
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bds_pro

# JWT
JWT_SECRET=your_jwt_secret

# CORS
CORS_ORIGIN=http://localhost:3000

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
TRON_RPC_URL=https://api.trongrid.io
TRON_PRIVATE_KEY=your_tron_private_key

# Wallet Addresses
USDT_ERC20_WALLET=0xdfca28ad998742570aecb7ffde1fe564b7d42c30
USDT_TRC20_WALLET=TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt

# Session
SESSION_SECRET=your_session_secret
```

## Security Features

### 1. Authentication & Authorization
- JWT token-based authentication
- Protected API endpoints
- User-specific data access

### 2. Input Validation
- Amount validation (minimum 50 USDT)
- Currency validation (ERC20/TRC20 only)
- Wallet address validation

### 3. Rate Limiting
- 100 requests per 15 minutes per IP
- Prevents abuse and DDoS attacks

### 4. Data Protection
- Sensitive data in environment variables
- Secure session management
- CORS protection

## Blockchain Integration

### Ethereum (ERC20) Integration
- **Library**: Ethers.js v6
- **Contract**: USDT (0xdAC17F958D2ee523a2206206994597C13D831ec7)
- **Monitoring**: Transfer events and balance checks
- **Network**: Ethereum Mainnet

### TRON (TRC20) Integration
- **Library**: TronWeb
- **Contract**: USDT (TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t)
- **Monitoring**: Smart contract interactions
- **Network**: TRON Mainnet

## User Flow

### Deposit Flow
1. User selects amount and payment method
2. System generates unique order ID
3. QR code and wallet address displayed
4. User sends USDT to provided address
5. Blockchain watcher monitors for transaction
6. Payment confirmed automatically
7. User balance updated

### Withdrawal Flow
1. User enters amount and wallet address
2. System validates withdrawal request
3. Withdrawal order created with pending status
4. Admin processes withdrawal manually
5. Status updated to paid/failed
6. User notified of result

## Error Handling

### Common Error Scenarios
- **Insufficient Balance**: User tries to withdraw more than available
- **Invalid Wallet**: Malformed wallet address
- **Expired Payment**: Payment not completed within 30 minutes
- **Network Issues**: Blockchain connectivity problems
- **Invalid Amount**: Below minimum threshold

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Monitoring & Logging

### Blockchain Watcher Logs
- Payment confirmation events
- Transaction hash logging
- Error tracking and reporting
- Performance metrics

### API Logging
- Request/response logging
- Error tracking
- Performance monitoring
- Security event logging

## Development Setup

### Prerequisites
- Node.js 18+
- MongoDB 5+
- npm or yarn

### Installation
```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm start
```

### Testing
```bash
# Test payment creation
curl -X POST http://localhost:5000/api/payments/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "USDT-ERC20", "userId": "test123"}'
```

## Production Considerations

### 1. Security
- Use HTTPS in production
- Implement proper CORS policies
- Regular security audits
- Private key management

### 2. Performance
- Database indexing optimization
- Caching strategies
- Load balancing
- CDN for static assets

### 3. Monitoring
- Real-time monitoring
- Alert systems
- Performance metrics
- Error tracking

### 4. Backup & Recovery
- Database backups
- Transaction logs
- Disaster recovery plans
- Data integrity checks

## Support & Maintenance

### Regular Tasks
- Monitor blockchain connectivity
- Update wallet balances
- Process withdrawal requests
- System health checks

### Troubleshooting
- Check blockchain RPC endpoints
- Verify wallet addresses
- Monitor transaction confirmations
- Review error logs

---

## Quick Start Guide

1. **Access the Application**: Navigate to `http://localhost:3000`
2. **Login**: Use Google OAuth or demo login
3. **Navigate to My Account**: Click "My Account" in the sidebar
4. **Create Deposit**: Select amount and payment method
5. **Send Payment**: Use provided wallet address or QR code
6. **Monitor Status**: Check payment status in history tab

The payment system is now fully integrated and ready for use! 🚀
