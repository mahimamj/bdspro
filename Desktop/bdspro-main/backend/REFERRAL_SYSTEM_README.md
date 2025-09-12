# 🔗 BDS PRO Multi-Level Referral System

A comprehensive SQL-based referral tracking system with views, stored procedures, and API endpoints for managing Level 1 and Level 2 referrals.

## 📊 System Overview

This system provides:
- **Multi-level referral tracking** (Level 1 & 2)
- **SQL views** for efficient querying
- **Stored procedures** for common operations
- **REST API endpoints** for frontend integration
- **Performance optimization** with proper indexing
- **Railway deployment** ready

## 🗄️ Database Schema

### Core Tables
- `users` - User information with `referrer_id` field
- `transactions` - Financial transactions including referral earnings
- `referrals` - Referral relationships (optional, views handle this)

### SQL Views
- `user_referrals` - Multi-level referral relationships
- `referral_stats` - Referral statistics per user
- `referral_earnings` - Referral earnings per user

### Stored Procedures
- `GetUserReferrals(user_id)` - Get all referrals for a user
- `GetUserReferralStats(user_id)` - Get referral statistics
- `GetUserReferralEarnings(user_id)` - Get referral earnings
- `GetReferralDashboard(user_id)` - Get complete dashboard data

## 🚀 Quick Start

### 1. Deploy to Railway

```bash
# Deploy referral views to Railway
node scripts/deploy-referral-views.js

# Test the deployment
node scripts/test-referral-views.js
```

### 2. Use in Your Application

```javascript
// Get all referrals for user 123
const response = await fetch('/api/referrals/user/123');
const referrals = await response.json();

// Get referral statistics
const statsResponse = await fetch('/api/referrals/stats/123');
const stats = await statsResponse.json();

// Get complete dashboard
const dashboardResponse = await fetch('/api/referrals/dashboard/123');
const dashboard = await dashboardResponse.json();
```

## 📋 API Endpoints

### Referral Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/referrals/user/:userId` | Get all referrals for a user |
| GET | `/api/referrals/stats/:userId` | Get referral statistics |
| GET | `/api/referrals/earnings/:userId` | Get referral earnings |
| GET | `/api/referrals/dashboard/:userId` | Get complete dashboard |
| GET | `/api/referrals/chain/:userId` | Get referral chain |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/referrals/admin/stats` | Get all referral stats |
| GET | `/api/referrals/admin/top-referrers` | Get top referrers |

## 🔍 SQL Usage Examples

### Basic Queries

```sql
-- Get all referrals for user 4
SELECT * FROM user_referrals WHERE referrer = 4;

-- Count referrals by level
SELECT referrer, level, COUNT(*) AS total 
FROM user_referrals 
GROUP BY referrer, level;

-- Get top referrers
SELECT referrer, referrer_name, COUNT(*) as total_referrals 
FROM user_referrals 
GROUP BY referrer, referrer_name 
ORDER BY total_referrals DESC 
LIMIT 10;
```

### Using Stored Procedures

```sql
-- Get all referrals for user 2
CALL GetUserReferrals(2);

-- Get referral statistics for user 2
CALL GetUserReferralStats(2);

-- Get referral earnings for user 2
CALL GetUserReferralEarnings(2);

-- Get complete dashboard for user 2
CALL GetReferralDashboard(2);
```

### Complex Analytics

```sql
-- Referral growth over time
SELECT 
    DATE(referral_joined_date) as date,
    level,
    COUNT(*) as new_referrals
FROM user_referrals 
WHERE referrer = 2
GROUP BY DATE(referral_joined_date), level
ORDER BY date DESC;

-- Referral earnings analysis
SELECT 
    u.user_id,
    u.name,
    re.level1_earnings,
    re.level2_earnings,
    re.total_referral_earnings,
    rs.total_referrals
FROM users u
JOIN referral_earnings re ON u.user_id = re.user_id
JOIN referral_stats rs ON u.user_id = rs.user_id
ORDER BY re.total_referral_earnings DESC;

-- Find users with no referrals
SELECT u.user_id, u.name, u.email 
FROM users u 
LEFT JOIN user_referrals ur ON u.user_id = ur.referrer 
WHERE ur.referrer IS NULL;
```

## 🏗️ Architecture

### Database Layer
- **Views**: Pre-computed referral relationships
- **Procedures**: Encapsulated business logic
- **Indexes**: Optimized for performance

### API Layer
- **Controllers**: Handle business logic
- **Routes**: RESTful endpoints
- **Middleware**: Authentication and validation

### Frontend Integration
- **React Components**: Display referral data
- **Real-time Updates**: WebSocket integration
- **Admin Dashboard**: Management interface

## ⚡ Performance Features

### Database Optimization
- **Indexes**: On `referrer_id`, `user_id`, `type`
- **Views**: Pre-computed joins
- **Connection Pooling**: Efficient database connections

### Caching Strategy
- **View-based**: SQL views cache complex queries
- **API-level**: Consider Redis for frequently accessed data
- **Frontend**: React state management

## 🔒 Security

### Authentication
- **JWT Tokens**: Secure API access
- **Role-based**: Admin vs user permissions
- **Rate Limiting**: Prevent abuse

### Data Protection
- **Input Validation**: Sanitize all inputs
- **SQL Injection**: Parameterized queries
- **Environment Variables**: Secure configuration

## 🧪 Testing

### Unit Tests
```bash
# Test referral views
node scripts/test-referral-views.js

# Test API endpoints
npm test
```

### Manual Testing
```bash
# Test specific user
curl http://localhost:5001/api/referrals/user/2

# Test admin endpoints
curl http://localhost:5001/api/referrals/admin/top-referrers
```

## 📈 Monitoring

### Database Performance
- Monitor query execution times
- Check index usage
- Track connection pool status

### API Performance
- Response time monitoring
- Error rate tracking
- Usage analytics

## 🚀 Deployment

### Railway Deployment
1. Push code to GitHub
2. Connect Railway to repository
3. Configure environment variables
4. Deploy referral views
5. Test endpoints

### Environment Variables
```env
RAILWAY_MYSQL_HOST=your_host
RAILWAY_MYSQL_PORT=3306
RAILWAY_MYSQL_USER=your_user
RAILWAY_MYSQL_PASSWORD=your_password
RAILWAY_MYSQL_DATABASE=your_database
RAILWAY_MYSQL_SSL=true
```

## 🔧 Troubleshooting

### Common Issues

1. **Views not created**
   - Check database permissions
   - Verify SQL syntax
   - Run deployment script manually

2. **API endpoints not working**
   - Check authentication
   - Verify route configuration
   - Check CORS settings

3. **Performance issues**
   - Check database indexes
   - Monitor query execution
   - Consider caching

### Debug Commands

```bash
# Check view existence
SELECT TABLE_NAME FROM information_schema.VIEWS WHERE TABLE_SCHEMA = 'your_database';

# Check procedure existence
SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = 'your_database';

# Test database connection
node -e "const mysql = require('mysql2/promise'); mysql.createConnection({...}).then(() => console.log('Connected')).catch(console.error);"
```

## 📚 Documentation

### SQL Reference
- [MySQL Views Documentation](https://dev.mysql.com/doc/refman/8.0/en/views.html)
- [MySQL Stored Procedures](https://dev.mysql.com/doc/refman/8.0/en/stored-programs.html)

### API Reference
- [Express.js Documentation](https://expressjs.com/)
- [MySQL2 Documentation](https://github.com/sidorares/node-mysql2)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Open an issue on GitHub

---

**Built with ❤️ for BDS PRO**
