# 🚀 Vercel Deployment Guide for BDS PRO

## Overview
This guide will help you deploy your BDS PRO application to Vercel with Railway database and Gmail email functionality.

## Prerequisites
- ✅ Vercel account (free)
- ✅ Railway account (free)
- ✅ Gmail account with App Password
- ✅ GitHub repository with your code

## Step 1: Environment Variables Setup

### 1.1 Vercel Environment Variables
Go to your Vercel dashboard → Project Settings → Environment Variables and add:

```env
# Database Configuration (Railway)
MYSQL_HOST=hopper.proxy.rlwy.net
MYSQL_PORT=50359
MYSQL_USER=root
MYSQL_PASSWORD=QxNkIyShqDFSigZzxHaxiyZmqtzekoXL
MYSQL_DATABASE=railway

# JWT Configuration
JWT_SECRET=demo_jwt_secret_key_for_development

# Email Configuration (Gmail)
EMAIL_USER=joshimahima798@gmail.com
EMAIL_PASS=bwbj yopj iros lujw
EMAIL_FROM=BDS PRO <noreply@bdspro.com>

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://bdspro-fawn.vercel.app
```

### 1.2 Important Notes
- **Never commit sensitive data** to your repository
- **Use Vercel's environment variables** for production secrets
- **Keep your Gmail App Password secure**

## Step 2: Deploy to Vercel

### 2.1 Connect GitHub Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository: `mahimamj/bdspro`
4. Select the `Final` folder as the root directory

### 2.2 Configure Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `Final`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 2.3 Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at: `https://bdspro-fawn.vercel.app`

## Step 3: Database Setup

### 3.1 Create Password Resets Table
Run this SQL in your Railway database:

```sql
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_email (email),
    INDEX idx_expires_at (expires_at)
);
```

### 3.2 Verify Database Connection
Your Railway database should be accessible from Vercel with the provided credentials.

## Step 4: Test Production Deployment

### 4.1 Test URLs
- **Main App**: https://bdspro-fawn.vercel.app
- **Login**: https://bdspro-fawn.vercel.app/login
- **Forgot Password**: https://bdspro-fawn.vercel.app/forgot-password
- **Reset Password**: https://bdspro-fawn.vercel.app/reset-password

### 4.2 Test Email Functionality
1. Go to: https://bdspro-fawn.vercel.app/forgot-password
2. Enter: `joshimahima798@gmail.com`
3. Click: "Send Reset Instructions"
4. Check your Gmail inbox
5. Click the reset link in the email
6. You should be taken to the reset password page

## Step 5: Production Features

### 5.1 Email Reset Links
- ✅ **Production URLs**: All reset links use `https://bdspro-fawn.vercel.app`
- ✅ **Secure tokens**: 64-character hex tokens with 1-hour expiration
- ✅ **Professional emails**: Beautiful HTML email templates
- ✅ **Database storage**: Tokens stored securely in Railway database

### 5.2 Security Features
- ✅ **JWT authentication**: Secure token-based auth
- ✅ **Password hashing**: bcrypt with salt rounds
- ✅ **Token expiration**: 1-hour reset token validity
- ✅ **Input validation**: Server-side validation for all inputs
- ✅ **Error handling**: Graceful error handling and user feedback

## Step 6: Monitoring and Maintenance

### 6.1 Vercel Analytics
- Enable Vercel Analytics in your dashboard
- Monitor performance and user behavior
- Track error rates and page views

### 6.2 Database Monitoring
- Monitor Railway database usage
- Check connection logs
- Monitor query performance

### 6.3 Email Monitoring
- Check Gmail for failed deliveries
- Monitor email sending logs
- Verify reset token usage

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs in Vercel dashboard
# Common fixes:
- Ensure all dependencies are in package.json
- Check for TypeScript errors
- Verify environment variables are set
```

#### 2. Database Connection Issues
```bash
# Verify Railway credentials
# Check network connectivity
# Ensure database is running
```

#### 3. Email Not Sending
```bash
# Check Gmail App Password
# Verify EMAIL_USER and EMAIL_PASS
# Check Vercel environment variables
```

#### 4. Reset Password Links Not Working
```bash
# Verify NEXT_PUBLIC_BASE_URL is set correctly
# Check that reset-password page exists
# Ensure token is being generated properly
```

## Production Checklist

- [ ] ✅ Environment variables configured in Vercel
- [ ] ✅ Database tables created (including password_resets)
- [ ] ✅ Gmail App Password configured
- [ ] ✅ Application deployed to Vercel
- [ ] ✅ All pages accessible (login, forgot-password, reset-password)
- [ ] ✅ Email functionality working
- [ ] ✅ Password reset flow complete
- [ ] ✅ Error handling working
- [ ] ✅ Mobile responsive design
- [ ] ✅ Performance optimized

## Support

If you encounter any issues:

1. **Check Vercel logs** in your dashboard
2. **Verify environment variables** are set correctly
3. **Test database connection** with Railway
4. **Check email configuration** with Gmail
5. **Review this guide** for common solutions

## Success! 🎉

Your BDS PRO application is now live on Vercel with:
- ✅ **Production-ready deployment**
- ✅ **Railway database integration**
- ✅ **Gmail email functionality**
- ✅ **Complete password reset system**
- ✅ **Professional UI/UX**
- ✅ **Mobile responsive design**

**Live URL**: https://bdspro-fawn.vercel.app
