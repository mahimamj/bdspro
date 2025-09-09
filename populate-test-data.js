// Script to populate the database with test data
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: process.env.MYSQL_HOST || "hopper.proxy.rlwy.net",
  port: Number(process.env.MYSQL_PORT) || 50359,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "QxNkIyShqDFSigZzxHaxiyZmqtzekoXL",
  database: process.env.MYSQL_DATABASE || "railway",
  ssl: {
    rejectUnauthorized: false
  }
});

async function populateTestData() {
  console.log('🚀 Starting to populate test data...\n');

  try {
    // 1. Create a test user
    console.log('👤 Creating test user...');
    const [userResult] = await db.execute(`
      INSERT INTO users (name, email, password_hash, account_balance, total_earning, rewards, referral_code, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      'Test User',
      'test@example.com',
      '$2b$10$dummy.hash.for.testing',
      1000.00,
      500.00,
      50.00,
      'TEST123'
    ]);

    const userId = userResult.insertId;
    console.log(`✅ Test user created with ID: ${userId}`);

    // 2. Create test transactions
    console.log('💰 Creating test transactions...');
    const testTransactions = [
      { type: 'deposit', amount: 1000.00, description: 'Initial deposit' },
      { type: 'level1_income', amount: 50.00, description: 'Level 1 referral income' },
      { type: 'level2_income', amount: 25.00, description: 'Level 2 referral income' },
      { type: 'reward', amount: 10.00, description: 'Bonus reward' },
      { type: 'withdrawal', amount: 100.00, description: 'Withdrawal request' }
    ];

    for (const transaction of testTransactions) {
      await db.execute(`
        INSERT INTO transactions (user_id, type, amount, credit, debit, balance, description, status, timestamp) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', NOW())
      `, [
        userId,
        transaction.type,
        transaction.amount,
        transaction.amount > 0 ? transaction.amount : 0,
        transaction.amount < 0 ? Math.abs(transaction.amount) : 0,
        transaction.amount, // Simplified balance calculation
        transaction.description
      ]);
    }

    console.log('✅ Test transactions created');

    // 3. Create test dashboard transactions (for the dashboard_transactions table)
    console.log('📊 Creating test dashboard transactions...');
    const dashboardTransactions = [
      { category: 'My Level 1 Income', amount: 39.93, transaction_id: 'TX1757020105556', withdrawal_from: 'Cashback' },
      { category: 'My Level 1 Income', amount: 27.59, transaction_id: 'TX1757020104556', withdrawal_from: 'Cashback' },
      { category: 'My Level 1 Income', amount: 61.25, transaction_id: 'TX1757020103556', withdrawal_from: 'Level 1' },
      { category: 'My Level 1 Income', amount: 43.55, transaction_id: 'TX1757020102556', withdrawal_from: 'Level 2' },
      { category: 'Account Balance', amount: 100.00, transaction_id: 'TX1757020101556', withdrawal_from: 'Deposit' },
      { category: 'Total Earnings', amount: 200.00, transaction_id: 'TX1757020100556', withdrawal_from: 'Referral' }
    ];

    for (const transaction of dashboardTransactions) {
      await db.execute(`
        INSERT INTO dashboard_transactions (category, date, withdrawal_amount, transaction_id, withdrawal_from) 
        VALUES (?, NOW(), ?, ?, ?)
      `, [
        transaction.category,
        transaction.amount,
        transaction.transaction_id,
        transaction.withdrawal_from
      ]);
    }

    console.log('✅ Test dashboard transactions created');

    // 4. Create test network data
    console.log('🌐 Creating test network data...');
    await db.execute(`
      INSERT INTO network (user_id, level1_income, level2_income, level1_business, level2_business, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `, [userId, 50.00, 25.00, 1000.00, 500.00]);

    console.log('✅ Test network data created');

    console.log('\n🎉 Test data population completed successfully!');
    console.log(`\n📋 Summary:`);
    console.log(`- User ID: ${userId}`);
    console.log(`- Email: test@example.com`);
    console.log(`- Account Balance: $1000.00`);
    console.log(`- Total Earnings: $500.00`);
    console.log(`- Transactions: ${testTransactions.length}`);
    console.log(`- Dashboard Transactions: ${dashboardTransactions.length}`);

    console.log('\n🔑 Test Token (for testing):');
    const jwt = require('jsonwebtoken');
    const testToken = jwt.sign(
      { 
        user_id: userId, 
        name: 'Test User', 
        email: 'test@example.com' 
      }, 
      process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development',
      { expiresIn: '24h' }
    );
    console.log(testToken);

  } catch (error) {
    console.error('❌ Error populating test data:', error);
  } finally {
    await db.end();
  }
}

// Run the script
populateTestData();
