# 🚀 Railway Deployment Guide for BDS PRO

This guide explains how to deploy the BDS PRO system with multi-level referral views to Railway.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Environment Variables**: Configured in Railway dashboard

## 🔧 Railway Setup

### 1. Connect GitHub Repository

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `bdspro` repository
5. Select the `main` branch

### 2. Add MySQL Database

1. In your Railway project, click "New"
2. Select "Database" → "MySQL"
3. Railway will automatically create a MySQL database
4. Note down the connection details

### 3. Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```env
# Database Configuration
RAILWAY_MYSQL_HOST=your_mysql_host
RAILWAY_MYSQL_PORT=3306
RAILWAY_MYSQL_USER=your_mysql_user
RAILWAY_MYSQL_PASSWORD=your_mysql_password
RAILWAY_MYSQL_DATABASE=your_mysql_database
RAILWAY_MYSQL_SSL=true

# Application Configuration
PORT=5001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 🚀 Deployment Process

### 1. Automatic Deployment

Railway will automatically deploy your application when you push to the main branch.

### 2. Deploy Referral Views

After your application is deployed, you need to run the referral views deployment script:

```bash
# SSH into your Railway deployment
railway shell

# Run the deployment script
node scripts/deploy-referral-views.js
```

### 3. Verify Deployment

Check that all views and procedures are working:

```sql
-- Test views
SELECT COUNT(*) FROM user_referrals;
SELECT COUNT(*) FROM referral_stats;
SELECT COUNT(*) FROM referral_earnings;

-- Test procedures
CALL GetUserReferrals(1);
CALL GetUserReferralStats(1);
```

## 📊 Available API Endpoints

Once deployed, your Railway application will have these endpoints:

### Referral Management
- `GET /api/referrals/user/:userId` - Get all referrals for a user
- `GET /api/referrals/stats/:userId` - Get referral statistics
- `GET /api/referrals/earnings/:userId` - Get referral earnings
- `GET /api/referrals/dashboard/:userId` - Get complete dashboard
- `GET /api/referrals/chain/:userId` - Get referral chain

### Admin Endpoints
- `GET /api/referrals/admin/stats` - Get all referral stats
- `GET /api/referrals/admin/top-referrers` - Get top referrers

### Payment System
- `POST /api/payments` - Submit payment
- `GET /api/payments` - Get payments (admin)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/verify-payment` - Verify payment

## 🧪 Testing the Deployment

### 1. Test API Endpoints

```bash
# Test health check
curl https://your-app.railway.app/health

# Test referral endpoints (replace with your user ID)
curl https://your-app.railway.app/api/referrals/user/1
curl https://your-app.railway.app/api/referrals/stats/1
```

### 2. Test Database Views

```sql
-- Get all referrals for user 1
SELECT * FROM user_referrals WHERE referrer = 1;

-- Get referral statistics
SELECT * FROM referral_stats ORDER BY total_referrals DESC;

-- Get top referrers
SELECT referrer, referrer_name, COUNT(*) as total_referrals 
FROM user_referrals 
GROUP BY referrer, referrer_name 
ORDER BY total_referrals DESC 
LIMIT 10;
```

## 🔍 Monitoring and Logs

### 1. View Logs
- Go to Railway dashboard
- Select your project
- Click on "Deployments" tab
- Click on your deployment
- View logs in real-time

### 2. Monitor Performance
- Check database performance in Railway dashboard
- Monitor API response times
- Set up alerts for errors

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check environment variables
   - Verify MySQL service is running
   - Check SSL configuration

2. **Views Not Created**
   - Run deployment script manually
   - Check database permissions
   - Verify SQL syntax

3. **API Endpoints Not Working**
   - Check CORS configuration
   - Verify authentication middleware
   - Check route definitions

### Debug Commands

```bash
# Check environment variables
railway variables

# View logs
railway logs

# Connect to database
railway connect mysql

# Run deployment script
railway run node scripts/deploy-referral-views.js
```

## 📈 Performance Optimization

### 1. Database Indexes
The deployment script automatically creates these indexes:
- `idx_users_referrer_id` on `users(referrer_id)`
- `idx_transactions_user_type` on `transactions(user_id, type)`
- `idx_transactions_related_user` on `transactions(related_user_id)`

### 2. Connection Pooling
The application uses MySQL connection pooling for better performance.

### 3. Caching
Consider implementing Redis caching for frequently accessed data.

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **Database Access**: Use Railway's built-in security features
3. **API Authentication**: All endpoints require proper authentication
4. **Rate Limiting**: Implemented to prevent abuse
5. **CORS**: Properly configured for your domain

## 📞 Support

If you encounter issues:

1. Check Railway documentation: [docs.railway.app](https://docs.railway.app)
2. Review application logs
3. Test database connections
4. Verify environment variables

## 🎉 Success!

Once deployed, your BDS PRO system will have:
- ✅ Multi-level referral tracking
- ✅ Real-time payment processing
- ✅ Admin dashboard
- ✅ Comprehensive API
- ✅ Scalable database architecture

Your application will be available at: `https://your-app.railway.app`
