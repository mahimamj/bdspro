const jwt = require('jsonwebtoken');

// Generate a demo JWT token
const payload = {
  user_id: 'demo_user_123',
  name: 'Demo User',
  email: 'demo@example.com',
  account_balance: 1000.00,
  total_earning: 500.00,
  rewards: 50.00
};

const secret = process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development';
const token = jwt.sign(payload, secret, { expiresIn: '24h' });

console.log('Generated JWT Token:');
console.log(token);
console.log('\nUse this token in the Authorization header:');
console.log(`Bearer ${token}`);
