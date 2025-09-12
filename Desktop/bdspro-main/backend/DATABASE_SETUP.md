# BDS PRO Database Setup and Calculations

## Overview
This document explains how to set up the database and understand how all calculations are stored and tracked in the BDS PRO system.

## Database Schema

### Core Tables

#### 1. `users` - User Information
- `user_id` (VARCHAR) - Primary key
- `name` (VARCHAR) - User's full name
- `email` (VARCHAR) - User's email (unique)
- `account_balance` (DECIMAL) - Current account balance
- `total_earning` (DECIMAL) - Total earnings (growth + referral income)
- `rewards` (DECIMAL) - Total referral earnings only
- `created_at`, `updated_at` (TIMESTAMP) - Timestamps

#### 2. `transactions` - All Financial Transactions
- `id` (INT) - Primary key
- `user_id` (VARCHAR) - Foreign key to users
- `type` (ENUM) - Transaction type: deposit, growth, level1_income, level2_income, withdrawal
- `amount` (DECIMAL) - Transaction amount
- `credit` (DECIMAL) - Credit amount
- `debit` (DECIMAL) - Debit amount
- `balance` (DECIMAL) - Balance after transaction
- `description` (TEXT) - Transaction description
- `status` (ENUM) - Transaction status: pending, completed, failed, cancelled
- `related_user_id` (VARCHAR) - For referral income tracking
- `related_transaction_id` (INT) - Links related transactions
- `timestamp` (TIMESTAMP) - Transaction timestamp

#### 3. `referrals` - Referral Relationships
- `id` (INT) - Primary key
- `referrer_id` (VARCHAR) - Who referred
- `referred_id` (VARCHAR) - Who was referred
- `level` (TINYINT) - Referral level (1 or 2)
- `created_at` (TIMESTAMP) - When referral was created

#### 4. `network` - Referral Network Statistics
- `id` (INT) - Primary key
- `user_id` (VARCHAR) - Foreign key to users
- `level1_income` (DECIMAL) - Total Level 1 referral income
- `level2_income` (DECIMAL) - Total Level 2 referral income
- `level1_business` (DECIMAL) - Total Level 1 business volume
- `level2_business` (DECIMAL) - Total Level 2 business volume
- `total_referral_income` (DECIMAL) - Total referral income
- `total_business_volume` (DECIMAL) - Total business volume
- `created_at`, `updated_at` (TIMESTAMP) - Timestamps

### Tracking Tables

#### 5. `growth_tracking` - 6% Monthly Growth Tracking
- `id` (INT) - Primary key
- `user_id` (VARCHAR) - Foreign key to users
- `original_deposit_id` (INT) - Foreign key to transactions
- `original_amount` (DECIMAL) - Original deposit amount
- `growth_amount` (DECIMAL) - Calculated growth amount
- `growth_percentage` (DECIMAL) - Growth percentage (default 6%)
- `processed_at` (TIMESTAMP) - When growth was processed
- `status` (ENUM) - pending, processed, failed

#### 6. `referral_income_tracking` - Referral Income Tracking
- `id` (INT) - Primary key
- `referrer_id` (VARCHAR) - Who gets the referral income
- `depositor_id` (VARCHAR) - Who made the deposit
- `deposit_transaction_id` (INT) - Foreign key to transactions
- `level` (TINYINT) - Referral level (1 or 2)
- `referral_income` (DECIMAL) - Calculated referral income
- `business_volume` (DECIMAL) - Business volume for this referral
- `processed_at` (TIMESTAMP) - When referral income was processed
- `status` (ENUM) - pending, processed, failed

#### 7. `system_settings` - System Configuration
- `id` (INT) - Primary key
- `setting_key` (VARCHAR) - Setting name
- `setting_value` (TEXT) - Setting value
- `description` (TEXT) - Setting description
- `updated_at` (TIMESTAMP) - Last updated

### Database Views

#### 1. `user_summary` - Complete User Information
Combines user data with network statistics for easy reporting.

#### 2. `transaction_summary` - Enhanced Transaction Data
Includes user names and related user information for transactions.

#### 3. `referral_network` - Referral Network View
Shows referral relationships with user names and details.

## Setup Instructions

### 1. Initialize Database
```bash
cd backend
node scripts/initDatabase.js
```

This will:
- Create the database if it doesn't exist
- Create all tables with proper relationships
- Insert default system settings
- Create helpful views for reporting

### 2. Environment Variables
Make sure your `.env` file has the correct database settings:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bds_pro
```

### 3. Start the Server
```bash
cd backend
npm start
```

## How Calculations Are Stored

### 1. Deposit Process
When a user deposits:
1. **Transaction Record**: Created in `transactions` table with type 'deposit'
2. **User Balance**: Updated in `users` table
3. **Referral Tracking**: If referrer exists, records created in `referrals` and `referral_income_tracking` tables
4. **Network Stats**: Updated in `network` table for referrers

### 2. Growth Process (6% Monthly)
After 30 days:
1. **Growth Tracking**: Record created in `growth_tracking` table
2. **Transaction Record**: Created in `transactions` table with type 'growth'
3. **User Balance**: Updated in `users` table
4. **Total Earnings**: Updated in `users` table

### 3. Referral Income Process
When referral income is calculated:
1. **Referral Income Tracking**: Record created in `referral_income_tracking` table
2. **Transaction Record**: Created in `transactions` table with type 'level1_income' or 'level2_income'
3. **User Balance**: Updated for referrer
4. **Network Stats**: Updated in `network` table
5. **Total Earnings & Rewards**: Updated in `users` table

## API Endpoints for Database Queries

### 1. User Reports
- `GET /api/reports/user/:userId` - Complete user report with all calculations
- `GET /api/deposits/balance/:userId` - User balance and recent transactions
- `GET /api/deposits/network/:userId` - User network statistics

### 2. System Reports
- `GET /api/reports/system` - System-wide statistics
- `GET /api/reports/transactions` - Detailed transaction report

### 3. Deposit Operations
- `POST /api/deposits/deposit` - Process deposits with referral logic
- `POST /api/growth/process` - Manually process growth calculations

## Testing the Database

### Run Comprehensive Tests
```bash
cd backend
node test-database-calculations.js
```

This will:
- Create test deposits with referrals
- Process growth calculations
- Generate comprehensive reports
- Show all database calculations

### Manual Database Queries

#### View All User Data
```sql
SELECT * FROM user_summary;
```

#### View All Transactions
```sql
SELECT * FROM transaction_summary ORDER BY timestamp DESC;
```

#### View Referral Network
```sql
SELECT * FROM referral_network;
```

#### View Growth Tracking
```sql
SELECT * FROM growth_tracking ORDER BY processed_at DESC;
```

#### View Referral Income Tracking
```sql
SELECT * FROM referral_income_tracking ORDER BY processed_at DESC;
```

## Key Features

### 1. Complete Audit Trail
- Every financial transaction is recorded
- All calculations are tracked with timestamps
- Failed operations are marked and can be retried

### 2. Referral System
- Level 1 and Level 2 referral tracking
- Automatic referral income calculation
- Business volume tracking for each level

### 3. Growth System
- 6% monthly growth on deposits
- Configurable growth percentage
- Automatic processing with cron jobs

### 4. Comprehensive Reporting
- User-level reports with all calculations
- System-wide statistics
- Transaction history with filtering
- Network analysis

### 5. Data Integrity
- Foreign key constraints
- Transaction rollback on errors
- Status tracking for all operations
- Duplicate prevention

## Maintenance

### Daily Tasks
- Growth processing runs automatically at 2 AM
- Referral income processing runs automatically
- Failed operations can be retried

### Weekly Tasks
- Review pending operations
- Check system statistics
- Monitor database performance

### Monthly Tasks
- Review growth calculations
- Analyze referral network growth
- Update system settings if needed

## Troubleshooting

### Common Issues
1. **Database Connection**: Check `.env` file settings
2. **Missing Tables**: Run `node scripts/initDatabase.js`
3. **Failed Calculations**: Check `growth_tracking` and `referral_income_tracking` tables
4. **Incorrect Balances**: Review transaction history in `transactions` table

### Debug Queries
```sql
-- Check user balances
SELECT user_id, name, account_balance, total_earning, rewards FROM users;

-- Check recent transactions
SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 10;

-- Check pending operations
SELECT * FROM growth_tracking WHERE status = 'pending';
SELECT * FROM referral_income_tracking WHERE status = 'pending';
```

This database system ensures all calculations are properly stored, tracked, and auditable, providing complete transparency and accountability for the BDS PRO platform.
