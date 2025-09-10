const mysql = require('mysql2/promise');

async function addTestDeposits() {
  try {
    console.log('=== ADDING TEST DEPOSITS ===');
    
    const db = await mysql.createConnection({
      host: 'hopper.proxy.rlwy.net',
      port: 50359,
      user: 'root',
      password: 'QxNkIyShqDFSigZzxHaxiyZmqtzekoXL',
      database: 'railway',
      ssl: { rejectUnauthorized: false }
    });

    // Get some users to create deposits for
    const [users] = await db.execute('SELECT user_id, name FROM users ORDER BY user_id LIMIT 5');
    console.log('Found users:', users);

    if (users.length === 0) {
      console.log('No users found. Please create some users first.');
      await db.end();
      return;
    }

    // Test deposits data
    const testDeposits = [
      {
        userId: users[0].user_id,
        amount: 100.00,
        paymentMethod: 'USDT (TRC20)',
        status: 'approved'
      },
      {
        userId: users[1]?.user_id || users[0].user_id,
        amount: 250.50,
        paymentMethod: 'USDT (BEP20)',
        status: 'pending'
      },
      {
        userId: users[2]?.user_id || users[0].user_id,
        amount: 500.00,
        paymentMethod: 'USDT (TRC20)',
        status: 'approved'
      },
      {
        userId: users[3]?.user_id || users[0].user_id,
        amount: 75.25,
        paymentMethod: 'USDT (BEP20)',
        status: 'rejected'
      },
      {
        userId: users[4]?.user_id || users[0].user_id,
        amount: 1000.00,
        paymentMethod: 'USDT (TRC20)',
        status: 'pending'
      }
    ];

    console.log('Adding test deposits...');
    
    for (const deposit of testDeposits) {
      try {
        const [result] = await db.execute(
          'INSERT INTO deposits (user_id, amount, payment_method, status) VALUES (?, ?, ?, ?)',
          [deposit.userId, deposit.amount, deposit.paymentMethod, deposit.status]
        );
        
        console.log(`✅ Deposit created: ID ${result.insertId}, User ${deposit.userId}, Amount $${deposit.amount}, Status ${deposit.status}`);
        
        // Add a small delay between deposits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error creating deposit for user ${deposit.userId}:`, error.message);
      }
    }

    // Show all deposits
    console.log('\n=== ALL DEPOSITS ===');
    const [allDeposits] = await db.execute(`
      SELECT 
        d.id,
        d.user_id,
        u.name as user_name,
        d.amount,
        d.payment_method,
        d.status,
        d.created_at
      FROM deposits d
      LEFT JOIN users u ON d.user_id = u.user_id
      ORDER BY d.created_at DESC
    `);

    allDeposits.forEach(deposit => {
      console.log(`ID: ${deposit.id} | User: ${deposit.user_name} (${deposit.user_id}) | Amount: $${deposit.amount} | Method: ${deposit.payment_method} | Status: ${deposit.status} | Date: ${deposit.created_at}`);
    });

    await db.end();
    console.log('\n✅ Test deposits added successfully!');
    console.log('Visit: https://bdspro-fawn.vercel.app/deposits to see the live table');
    
  } catch (error) {
    console.error('❌ Error adding test deposits:', error.message);
  }
}

addTestDeposits();
