const mysql = require('mysql2/promise');

async function testDatabaseInsert() {
  let connection;
  
  try {
    // Railway database connection
    const config = {
      host: "hopper.proxy.rlwy.net",
      port: 50359,
      user: "root",
      password: "QxNkIyShqDFSigZzxHaxiyZmqtzekoXL",
      database: "railway",
      ssl: { rejectUnauthorized: false }
    };

    connection = await mysql.createConnection(config);
    console.log('Connected to database successfully!');

    // Test insert
    const [result] = await connection.execute(
      'INSERT INTO images (referred_id, referrer_id, image_url, transaction_hash, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
      [1, null, '/test/test.jpg', 'test_hash_123', '50.00', 'pending']
    );

    console.log('Insert result:', result);
    console.log('Insert ID:', result.insertId);

    // Check count
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM images');
    console.log('Total images count:', countResult[0].count);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDatabaseInsert();
