const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testUsers = [
  { user_id: 'user1', name: 'John Doe', email: 'john@example.com' },
  { user_id: 'user2', name: 'Jane Smith', email: 'jane@example.com' },
  { user_id: 'user3', name: 'Bob Wilson', email: 'bob@example.com' }
];

// Generate a test JWT token (you'll need to replace this with a real token)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcjEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3MzU5MzQ0MDAsImV4cCI6MTczNTkzODAwMH0.demo_signature';

const headers = {
  'Authorization': `Bearer ${TEST_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testDepositAPI() {
  console.log('🧪 Testing Deposit API...\n');

  try {
    // Test 1: User 1 deposits $1000 (no referral)
    console.log('1️⃣ User 1 deposits $1000 (no referral)');
    const deposit1 = await axios.post(`${API_BASE}/deposits/deposit`, {
      userId: 'user1',
      amount: 1000
    }, { headers });
    console.log('✅ Response:', deposit1.data);
    console.log('');

    // Test 2: User 2 deposits $2000 with User 1 as referrer
    console.log('2️⃣ User 2 deposits $2000 with User 1 as referrer');
    const deposit2 = await axios.post(`${API_BASE}/deposits/deposit`, {
      userId: 'user2',
      amount: 2000,
      referrerCode: 'user1'
    }, { headers });
    console.log('✅ Response:', deposit2.data);
    console.log('');

    // Test 3: User 3 deposits $3000 with User 2 as referrer (User 1 gets Level 2)
    console.log('3️⃣ User 3 deposits $3000 with User 2 as referrer');
    const deposit3 = await axios.post(`${API_BASE}/deposits/deposit`, {
      userId: 'user3',
      amount: 3000,
      referrerCode: 'user2'
    }, { headers });
    console.log('✅ Response:', deposit3.data);
    console.log('');

    // Test 4: Get User 1 balance
    console.log('4️⃣ Get User 1 balance and earnings');
    const balance1 = await axios.get(`${API_BASE}/deposits/balance/user1`, { headers });
    console.log('✅ Response:', balance1.data);
    console.log('');

    // Test 5: Get User 1 network stats
    console.log('5️⃣ Get User 1 network stats');
    const network1 = await axios.get(`${API_BASE}/deposits/network/user1`, { headers });
    console.log('✅ Response:', network1.data);
    console.log('');

    // Test 6: Get User 2 network stats
    console.log('6️⃣ Get User 2 network stats');
    const network2 = await axios.get(`${API_BASE}/deposits/network/user2`, { headers });
    console.log('✅ Response:', network2.data);
    console.log('');

    // Test 7: Process growth manually (simulate 30 days later)
    console.log('7️⃣ Process growth manually (6% monthly)');
    const growth = await axios.post(`${API_BASE}/growth/process`, {}, { headers });
    console.log('✅ Response:', growth.data);
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testDepositAPI();
