# BDS PRO Crypto Payment Gateway

A complete full-stack web application for cryptocurrency payments with real-time status updates, admin dashboard, and email notifications.

## 🚀 Features

### Frontend
- **Modern Payment Interface**: Clean, responsive design with QR codes for both TRC20 and BEP20 networks
- **Real-time Updates**: WebSocket integration for instant payment status updates
- **File Upload**: Secure screenshot upload for transaction verification
- **Network Selection**: Easy switching between TRON (TRC20) and BSC (BEP20) networks
- **Mobile Responsive**: Optimized for all device sizes

### Backend
- **Express.js API**: RESTful API with comprehensive error handling
- **MongoDB Integration**: Scalable database for payment storage
- **File Upload**: Multer-based image upload with validation
- **JWT Authentication**: Secure admin authentication system
- **Email Notifications**: Automated email alerts using Nodemailer
- **WebSocket Support**: Real-time communication with Socket.IO
- **Input Validation**: Comprehensive data validation and sanitization

### Admin Dashboard
- **Secure Login**: Protected admin interface
- **Payment Management**: View, search, and filter all payments
- **Status Updates**: Mark payments as paid or rejected
- **Real-time Updates**: Live payment status changes
- **Screenshot Preview**: View transaction screenshots
- **Analytics**: Payment statistics and summaries

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Socket.IO
- **Authentication**: JWT tokens
- **File Upload**: Multer
- **Email**: Nodemailer
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Lucide React

## 📦 Installation

1. **Clone and Install Dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

2. **Environment Setup**
   
   Create `backend/.env`:
   ```env
   PORT=5001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/bdspro_payments
   JWT_SECRET=your_jwt_secret_key_here_development_only
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   CORS_ORIGIN=http://localhost:3000
   ```

   Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001
   ```

3. **Generate QR Codes**
   ```bash
   node generate-qr-codes.js
   ```

4. **Start MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Start MongoDB service

## 🚀 Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Payment Gateway: http://localhost:3000/payment
   - Admin Dashboard: http://localhost:3000/admin
   - API Health: http://localhost:5001/health

## 📱 Usage

### For Users
1. Visit the payment page
2. Select network (TRC20 or BEP20)
3. Scan QR code or copy wallet address
4. Send USDT to the provided address
5. Fill out payment form with transaction details
6. Upload screenshot of transaction
7. Submit payment and wait for confirmation

### For Admins
1. Login to admin dashboard
2. View all pending payments
3. Click on payment to view details
4. Verify transaction screenshot
5. Mark as paid or rejected
6. User receives real-time notification

## 🔧 API Endpoints

### Payment Endpoints
- `POST /api/payments` - Submit new payment
- `GET /api/payments` - Get all payments (admin only)
- `GET /api/payments/:id` - Get payment by ID
- `PUT /api/payments/:id/status` - Update payment status (admin only)

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `GET /api/admin/verify` - Verify admin token

## 🔒 Security Features

- **Input Validation**: All inputs are validated and sanitized
- **File Upload Security**: Only image files (JPG/PNG) up to 5MB
- **JWT Authentication**: Secure token-based admin authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configured CORS for security
- **Helmet Security**: Security headers with Helmet

## 📧 Email Configuration

To enable email notifications, configure these environment variables:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🔌 WebSocket Events

- `join-payment-room` - Join payment-specific room
- `payment-status-updated` - Real-time status updates

## 📊 Database Schema

### Payment Collection
```javascript
{
  name: String,
  email: String,
  amount: Number,
  network: String, // 'TRC20' or 'BEP20'
  screenshotURL: String,
  status: String, // 'pending', 'paid', 'rejected'
  txHash: String, // Optional
  paidAt: Date, // Optional
  adminNotes: String, // Optional
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Customization

### Wallet Addresses
Update addresses in `generate-qr-codes.js`:
```javascript
const addresses = {
  TRC20: 'YOUR_TRC20_ADDRESS',
  BEP20: 'YOUR_BEP20_ADDRESS'
};
```

### Styling
- Modify Tailwind classes in component files
- Update color scheme in `tailwind.config.js`
- Customize animations in Framer Motion components

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or MongoDB server
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or similar platforms
3. Update API URLs in environment variables

## 📝 Environment Variables Reference

### Backend (.env)
- `PORT` - Server port (default: 5001)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `ADMIN_USERNAME` - Admin login username
- `ADMIN_PASSWORD` - Admin login password
- `EMAIL_SERVICE` - Email service provider
- `EMAIL_USER` - Email username
- `EMAIL_PASS` - Email password/app password

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL

## 🐛 Troubleshooting

### Common Issues
1. **MongoDB Connection Error**: Ensure MongoDB is running and connection string is correct
2. **File Upload Issues**: Check file size limits and file types
3. **WebSocket Connection**: Verify CORS settings and Socket.IO configuration
4. **Email Notifications**: Check email service credentials and app passwords

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Email: team.bdspro@gmail.com
- Website: www.bdspro.io

---

**⚠️ Disclaimer**: This is a demo payment gateway. Always implement additional security measures for production use, including proper SSL certificates, database encryption, and regular security audits.
