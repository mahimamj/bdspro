# Email Setup Guide for BDS PRO

## Overview
This guide will help you set up email functionality for password reset and other notifications in your BDS PRO application.

## Prerequisites
- Gmail account (or other email service)
- Access to your application's environment variables

## Step 1: Gmail Setup (Recommended)

### 1.1 Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Factor Authentication if not already enabled

### 1.2 Generate App Password
1. Go to Google Account → Security
2. Under "2-Step Verification", click "App passwords"
3. Select "Mail" and "Other (Custom name)"
4. Enter "BDS PRO" as the name
5. Copy the generated 16-character password

## Step 2: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database Configuration
MYSQL_HOST=hopper.proxy.rlwy.net
MYSQL_PORT=50359
MYSQL_USER=root
MYSQL_PASSWORD=QxNkIyShqDFSigZzxHaxiyZmqtzekoXL
MYSQL_DATABASE=railway

# JWT Configuration
JWT_SECRET=demo_jwt_secret_key_for_development

# Email Configuration (REQUIRED FOR PASSWORD RESET)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=BDS PRO <noreply@bdspro.com>

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 3: Database Setup

The password reset functionality requires a `password_resets` table. Run this SQL command in your database:

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

## Step 4: Install Dependencies

Run the following command to install the required email dependencies:

```bash
npm install nodemailer @types/nodemailer
```

## Step 5: Test Email Functionality

1. Start your application: `npm run dev`
2. Go to the forgot password page
3. Enter a valid email address
4. Check your email inbox for the reset link

## Alternative Email Services

### Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

Update the email service in `lib/emailService.ts`:
```typescript
const transporter = nodemailer.createTransport({
  service: 'hotmail', // or 'outlook'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### Yahoo Mail
```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

Update the email service in `lib/emailService.ts`:
```typescript
const transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### Custom SMTP Server
```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-password
EMAIL_SECURE=false
```

Update the email service in `lib/emailService.ts`:
```typescript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Make sure you're using an App Password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled

2. **"Connection timeout" error**
   - Check your internet connection
   - Verify the email service settings

3. **"Authentication failed" error**
   - Double-check your email credentials
   - Make sure the App Password is correct

4. **Emails not being received**
   - Check spam/junk folder
   - Verify the email address is correct
   - Check if your email provider blocks automated emails

### Testing Email Configuration

You can test your email setup by creating a simple test script:

```javascript
// test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

transporter.sendMail({
  from: 'BDS PRO <noreply@bdspro.com>',
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'This is a test email from BDS PRO'
}, (error, info) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email sent:', info.messageId);
  }
});
```

Run with: `node test-email.js`

## Security Notes

1. **Never commit your `.env.local` file to version control**
2. **Use App Passwords instead of regular passwords**
3. **Rotate your App Passwords regularly**
4. **Use environment variables in production**

## Production Deployment

For production deployment (Vercel, Netlify, etc.):

1. Add the environment variables in your hosting platform's dashboard
2. Make sure `NEXT_PUBLIC_BASE_URL` points to your production domain
3. Use a professional email service like SendGrid, Mailgun, or AWS SES for better deliverability

## Support

If you encounter any issues with email setup, check:
1. Email service provider documentation
2. Application logs for error messages
3. Network connectivity
4. Environment variable configuration
