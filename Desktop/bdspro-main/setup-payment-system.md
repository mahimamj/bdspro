# BDS PRO Payment System Setup Guide

## Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/bdspro_payments

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_development_only
JWT_EXPIRES_IN=24h

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Email Configuration (Optional - for email notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Create a `.env.local` file in the root directory for Next.js:

```env
# Next.js Public Variables
NEXT_PUBLIC_API_URL=http://localhost:5001
```

## MongoDB Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Start MongoDB service
3. The application will automatically create the database and collections

## QR Code Images

You need to generate QR codes for the wallet addresses and place them in the `public` directory:

- `public/qr-trc20.png` - QR code for TRC20 address: TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt
- `public/qr-bep20.png` - QR code for BEP20 address: 0xdfca28ad998742570aecb7ffde1fe564b7d42c30

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the Next.js frontend:
   ```bash
   npm run dev
   ```

## Access Points

- **Payment Gateway**: http://localhost:3000/payment
- **Admin Dashboard**: http://localhost:3000/admin
- **Payment Status**: http://localhost:3000/payment-status?id=PAYMENT_ID
- **API Health Check**: http://localhost:5001/health

## Features

### Frontend
- Modern payment form with QR codes
- Network selection (TRC20/BEP20)
- File upload for transaction screenshots
- Real-time status updates via WebSocket
- Responsive design with Tailwind CSS

### Backend
- Express.js API with MongoDB
- File upload handling with multer
- JWT authentication for admin
- Email notifications with nodemailer
- WebSocket for real-time updates
- Input validation and sanitization

### Admin Dashboard
- Secure login system
- Payment management interface
- Status updates (pending/paid/rejected)
- Search and filter functionality
- Real-time updates

## Security Features

- Input validation and sanitization
- File type and size validation
- JWT token authentication
- Rate limiting
- CORS protection
- Helmet security headers

## Email Notifications

Configure email settings in the `.env` file to enable:
- Payment submission confirmations
- Payment status updates
- Admin notifications

## WebSocket Integration

The system uses Socket.IO for real-time updates:
- Users receive instant status updates
- Admin dashboard shows live payment data
- No page refresh required for status changes
