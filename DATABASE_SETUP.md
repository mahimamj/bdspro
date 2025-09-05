# Database Setup for Netlify Deployment

## 🗄️ **Database Options for Netlify**

Since Netlify is a static hosting platform, you need external database services:

### **Option 1: PlanetScale (MySQL) - Recommended**
- **URL**: https://planetscale.com/
- **Type**: MySQL-compatible
- **Free Tier**: 1 database, 1 billion reads/month
- **Setup**:
  1. Sign up with GitHub
  2. Create database: `bds_pro_db`
  3. Get connection string
  4. Add to Netlify environment variables

### **Option 2: Supabase (PostgreSQL)**
- **URL**: https://supabase.com/
- **Type**: PostgreSQL
- **Free Tier**: 500MB database, 50MB file storage
- **Setup**:
  1. Create new project
  2. Get connection string
  3. Add to Netlify environment variables

### **Option 3: Railway (MySQL/PostgreSQL)**
- **URL**: https://railway.app/
- **Type**: MySQL or PostgreSQL
- **Free Tier**: $5 credit monthly
- **Setup**:
  1. Deploy MySQL template
  2. Get connection string
  3. Add to Netlify environment variables

## 🔧 **Environment Variables for Netlify**

Add these to your Netlify site settings:

```
DATABASE_URL=mysql://username:password@host:port/database_name
NEXT_PUBLIC_API_URL=https://your-backend-url.herokuapp.com
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
```

## 🚀 **Backend Deployment Options**

Since your backend needs to run separately:

### **Option 1: Heroku**
1. Create `Procfile` in backend folder
2. Deploy backend to Heroku
3. Update `NEXT_PUBLIC_API_URL` in Netlify

### **Option 2: Railway**
1. Connect GitHub repository
2. Deploy backend service
3. Update API URL in Netlify

### **Option 3: Vercel (for API routes)**
1. Deploy backend as Vercel functions
2. Update API endpoints
3. Update `NEXT_PUBLIC_API_URL`

## 📋 **Database Schema Migration**

To migrate your existing database:

1. **Export from local MySQL**:
   ```sql
   mysqldump -u root -p bds_pro_db > bds_pro_db.sql
   ```

2. **Import to new database**:
   ```sql
   mysql -h host -u username -p database_name < bds_pro_db.sql
   ```

## 🔍 **Testing Database Connection**

Test your database connection:

```javascript
// Test script
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('Database connected successfully!');
    await connection.end();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();
```
