# BDS PRO Deposit & Referral API Documentation

## Overview
This API handles user deposits, referral income calculations (Level 1 & 2), and 6% monthly growth processing for the BDS PRO platform.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Process Deposit
**POST** `/deposits/deposit`

Process a user deposit with optional referral logic.

#### Request Body
```json
{
  "userId": "string",
  "amount": "number",
  "referrerCode": "string" // optional
}
```

#### Response
```json
{
  "success": true,
  "message": "Deposit processed successfully",
  "data": {
    "userId": "user1",
    "depositAmount": 1000,
    "newBalance": 1000,
    "referralApplied": true,
    "level1Referrer": "user2",
    "level2Referrer": "user3"
  }
}
```

#### Example
```bash
curl -X POST http://localhost:5000/api/deposits/deposit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user1",
    "amount": 1000,
    "referrerCode": "user2"
  }'
```

### 2. Get User Balance
**GET** `/deposits/balance/:userId`

Get user's current balance, earnings, and recent transactions.

#### Response
```json
{
  "success": true,
  "data": {
    "userId": "user1",
    "name": "John Doe",
    "email": "john@example.com",
    "accountBalance": 1060.00,
    "totalEarning": 60.00,
    "rewards": 50.00,
    "recentTransactions": [
      {
        "id": 1,
        "user_id": "user1",
        "type": "deposit",
        "amount": 1000.00,
        "credit": 1000.00,
        "debit": 0.00,
        "balance": 1000.00,
        "description": "Deposit of $1000",
        "status": "completed",
        "timestamp": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

### 3. Get User Network Stats
**GET** `/deposits/network/:userId`

Get user's referral network statistics.

#### Response
```json
{
  "success": true,
  "data": {
    "userId": "user1",
    "name": "John Doe",
    "email": "john@example.com",
    "networkStats": {
      "level1Income": 20.00,
      "level2Income": 30.00,
      "level1Business": 2000.00,
      "level2Business": 3000.00,
      "totalReferralIncome": 50.00,
      "totalBusinessVolume": 5000.00
    }
  }
}
```

### 4. Process Growth (Manual)
**POST** `/growth/process`

Manually trigger the 6% monthly growth processing for all eligible deposits.

#### Response
```json
{
  "success": true,
  "message": "Growth processing completed",
  "data": {
    "totalProcessed": 3,
    "successful": 3,
    "failed": 0,
    "results": [
      {
        "userId": "user1",
        "depositAmount": 1000,
        "growthAmount": 60,
        "newBalance": 1060,
        "success": true
      }
    ]
  }
}
```

## Business Rules

### Deposits
- When a user deposits, a transaction record is created with `type = "deposit"`
- User's `account_balance` is increased by the deposit amount
- If a `referrerCode` is provided, referral relationships are established

### Growth (6% Monthly)
- After 30 days, 6% of the deposit amount is added to user's balance
- A transaction record is created with `type = "growth"`
- User's `total_earning` is updated with the growth amount

### Referrals
- **Level 1 (Direct)**: Referrer gets 1% of referred user's deposit
- **Level 2 (Indirect)**: Referrer's referrer gets 1% of referred user's deposit
- Referral income is calculated and distributed after 1 month
- `network` table tracks all referral statistics

### Database Tables

#### users
- `user_id`, `name`, `email`, `account_balance`, `total_earning`, `rewards`

#### transactions
- `id`, `user_id`, `type`, `amount`, `credit`, `debit`, `balance`, `description`, `status`, `timestamp`

#### referrals
- `id`, `referrer_id`, `referred_id`, `level`, `created_at`

#### network
- `id`, `user_id`, `level1_income`, `level2_income`, `level1_business`, `level2_business`

## Example Flow

1. **User A deposits $1000**
   - Transaction created: `type="deposit", amount=1000`
   - A's balance: $1000

2. **After 30 days (Growth)**
   - Growth: $60 (6% of $1000)
   - Transaction created: `type="growth", amount=60`
   - A's balance: $1060

3. **User B deposits $2000 with A's referral**
   - B's deposit logged
   - After 30 days: B gets $120 growth
   - A gets $20 (1% of $2000) as level1_income
   - A's network.level1_business increases by $2000

4. **User C deposits $3000 with B's referral**
   - C's deposit logged
   - After 30 days: C gets $180 growth
   - B gets $30 (1% of $3000) as level1_income
   - A gets $30 (1% of $3000) as level2_income
   - A's network.level2_business increases by $3000

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid token)
- `404` - Not Found (user not found)
- `500` - Internal Server Error

## Testing

Use the provided test script:
```bash
node test-deposit-api.js
```

This will test all endpoints with sample data and demonstrate the complete flow.
