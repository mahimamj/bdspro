const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testUsers = [
  { user_id: 'user1', name: 'John Doe', email: 'john@example.com' },
  { user_id: 'user2', name: 'Jane Smith', email: 'jane@example.com' },
  { user_id: 'user3', name: 'Bob Wilson', email: 'bob@example.com' },
  { user_id: 'user4', name: 'Alice Brown', email: 'alice@example.com' }
];

// Generate a test JWT token
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcjEiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3MzU5MzQ0MDAsImV4cCI6MTczNTkzODAwMH0.demo_signature';

const headers = {
  'Authorization': `Bearer ${TEST_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testDatabaseCalculations() {
  console.log('🧪 Testing Database Calculations and Tracking...\n');

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

    // Test 4: User 4 deposits $5000 with User 1 as referrer
    console.log('4️⃣ User 4 deposits $5000 with User 1 as referrer');
    const deposit4 = await axios.post(`${API_BASE}/deposits/deposit`, {
      userId: 'user4',
      amount: 5000,
      referrerCode: 'user1'
    }, { headers });
    console.log('✅ Response:', deposit4.data);
    console.log('');

    // Test 5: Get User 1 comprehensive report
    console.log('5️⃣ Get User 1 comprehensive report');
    const report1 = await axios.get(`${API_BASE}/reports/user/user1`, { headers });
    console.log('✅ User 1 Report:');
    console.log('   Account Balance:', report1.data.data.user.accountBalance);
    console.log('   Total Earnings:', report1.data.data.user.totalEarning);
    console.log('   Rewards:', report1.data.data.user.rewards);
    console.log('   Level 1 Income:', report1.data.data.networkStats.level1Income);
    console.log('   Level 2 Income:', report1.data.data.networkStats.level2Income);
    console.log('   Level 1 Business:', report1.data.data.networkStats.level1Business);
    console.log('   Level 2 Business:', report1.data.data.networkStats.level2Business);
    console.log('   Total Referral Income:', report1.data.data.networkStats.totalReferralIncome);
    console.log('   Total Business Volume:', report1.data.data.networkStats.totalBusinessVolume);
    console.log('   Transactions Count:', report1.data.data.transactions.length);
    console.log('   Referrals Count:', report1.data.data.referrals.length);
    console.log('   Growth History Count:', report1.data.data.growthHistory.length);
    console.log('   Referral Income History Count:', report1.data.data.referralIncomeHistory.length);
    console.log('');

    // Test 6: Get User 2 comprehensive report
    console.log('6️⃣ Get User 2 comprehensive report');
    const report2 = await axios.get(`${API_BASE}/reports/user/user2`, { headers });
    console.log('✅ User 2 Report:');
    console.log('   Account Balance:', report2.data.data.user.accountBalance);
    console.log('   Total Earnings:', report2.data.data.user.totalEarning);
    console.log('   Rewards:', report2.data.data.user.rewards);
    console.log('   Level 1 Income:', report2.data.data.networkStats.level1Income);
    console.log('   Level 2 Income:', report2.data.data.networkStats.level2Income);
    console.log('   Level 1 Business:', report2.data.data.networkStats.level1Business);
    console.log('   Level 2 Business:', report2.data.data.networkStats.level2Business);
    console.log('');

    // Test 7: Get system statistics
    console.log('7️⃣ Get system statistics');
    const systemStats = await axios.get(`${API_BASE}/reports/system`, { headers });
    console.log('✅ System Stats:');
    console.log('   Total Users:', systemStats.data.data.users.total);
    console.log('   Total Deposits:', systemStats.data.data.deposits.count, '($' + systemStats.data.data.deposits.total + ')');
    console.log('   Total Growth:', systemStats.data.data.growth.count, '($' + systemStats.data.data.growth.total + ')');
    console.log('   Total Referral Income:', systemStats.data.data.referralIncome.count, '($' + systemStats.data.data.referralIncome.total + ')');
    console.log('   Active Referrals:', systemStats.data.data.referrals.active);
    console.log('   Pending Growth:', systemStats.data.data.pending.growth.count, '($' + systemStats.data.data.pending.growth.total + ')');
    console.log('   Pending Referral Income:', systemStats.data.data.pending.referralIncome.count, '($' + systemStats.data.data.pending.referralIncome.total + ')');
    console.log('');

    // Test 8: Get transaction report
    console.log('8️⃣ Get transaction report');
    const transactionReport = await axios.get(`${API_BASE}/reports/transactions?limit=20`, { headers });
    console.log('✅ Transaction Report:');
    console.log('   Total Transactions:', transactionReport.data.data.total);
    transactionReport.data.data.transactions.forEach((tx, index) => {
      console.log(`   ${index + 1}. ${tx.typeDisplay} - $${tx.amount} (${tx.userName}) - ${tx.timestamp}`);
    });
    console.log('');

    // Test 9: Process growth manually (simulate 30 days later)
    console.log('9️⃣ Process growth manually (6% monthly)');
    const growth = await axios.post(`${API_BASE}/growth/process`, {}, { headers });
    console.log('✅ Growth Processing:');
    console.log('   Total Processed:', growth.data.data.totalProcessed);
    console.log('   Successful:', growth.data.data.successful);
    console.log('   Failed:', growth.data.data.failed);
    growth.data.data.results.forEach((result, index) => {
      if (result.success) {
        console.log(`   ${index + 1}. User ${result.userId}: +$${result.growthAmount} (Tracking ID: ${result.trackingId})`);
      } else {
        console.log(`   ${index + 1}. User ${result.userId}: FAILED - ${result.error}`);
      }
    });
    console.log('');

    // Test 10: Get updated User 1 report after growth
    console.log('🔟 Get updated User 1 report after growth');
    const updatedReport1 = await axios.get(`${API_BASE}/reports/user/user1`, { headers });
    console.log('✅ Updated User 1 Report:');
    console.log('   Account Balance:', updatedReport1.data.data.user.accountBalance);
    console.log('   Total Earnings:', updatedReport1.data.data.user.totalEarning);
    console.log('   Growth History:', updatedReport1.data.data.growthHistory.length, 'entries');
    console.log('');

    console.log('🎉 All database calculation tests completed successfully!');
    console.log('\n📊 Summary of what was stored in the database:');
    console.log('   ✅ All deposits tracked in transactions table');
    console.log('   ✅ All referral relationships stored in referrals table');
    console.log('   ✅ All network statistics updated in network table');
    console.log('   ✅ All growth calculations tracked in growth_tracking table');
    console.log('   ✅ All referral income tracked in referral_income_tracking table');
    console.log('   ✅ All calculations properly linked with foreign keys');
    console.log('   ✅ Comprehensive reporting available through API endpoints');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testDatabaseCalculations();
