# 🚀 Setup Guide for Collaborators

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/nitin122n/bdspro.git
cd bdspro
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Setup
```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Edit the .env files with your own credentials
```

### 4. Start the Application
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
node server.js
```

## 🔧 Required Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Backend (backend/.env)
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/bdspro_payments
JWT_SECRET=your-jwt-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📁 Project Structure
```
bdspro/
├── app/                    # Next.js frontend
│   ├── account/           # Payment system (My Account)
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # Main dashboard
│   └── api/               # API routes
├── backend/               # Node.js/Express backend
│   ├── controllers/       # API controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── services/         # Email, etc.
├── components/            # React components
├── public/               # Static files (QR codes)
└── lib/                  # Utilities
```

## 🎯 Key Features
- **Modern Payment UI**: Dark blue gradient design
- **Two-Column Layout**: QR code + payment form
- **Network Support**: TRC20 and BEP20
- **Admin Dashboard**: Payment management
- **Real-time Updates**: WebSocket integration
- **File Upload**: Transaction screenshots
- **Email Notifications**: Payment confirmations

## 🔄 Working with the Repository

### Pull Latest Changes
```bash
git pull origin main
```

### Make Changes
```bash
# Create a new branch
git checkout -b feature/your-feature-name

# Make your changes
# ... edit files ...

# Commit changes
git add .
git commit -m "Add your feature"

# Push to your fork
git push origin feature/your-feature-name
```

### Create Pull Request
1. Go to GitHub repository
2. Click "Compare & pull request"
3. Describe your changes
4. Submit for review

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 5001
npx kill-port 5001
```

### Database Connection Issues
- Ensure MongoDB is running
- Check MONGO_URI in backend/.env
- Verify database credentials

### Missing Dependencies
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support
- **Repository**: https://github.com/nitin122n/bdspro
- **Issues**: Create an issue on GitHub
- **Documentation**: Check the various .md files in the repository

## 🚀 Deployment
- **Frontend**: Deploy to Vercel, Netlify, or any Next.js hosting
- **Backend**: Deploy to Railway, Heroku, or any Node.js hosting
- **Database**: Use MongoDB Atlas for production

Happy coding! 🎉
