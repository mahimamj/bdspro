const mysql = require('mysql2/promise');

async function fixImagesTable() {
  let connection;
  
  try {
    // Railway database connection (external)
    const config = {
      host: "hopper.proxy.rlwy.net",
      port: 50359,
      user: "root",
      password: "QxNkIyShqDFSigZzxHaxiyZmqtzekoXL",
      database: "railway",
      ssl: { rejectUnauthorized: false }
    };

    // Create connection
    connection = await mysql.createConnection(config);

    console.log('Connected to database successfully!');

    // Make referrer_id nullable
    console.log('Making referrer_id nullable...');
    await connection.execute('ALTER TABLE images MODIFY COLUMN referrer_id INT NULL');
    console.log('✅ referrer_id is now nullable');

    // Make transaction_hash nullable
    console.log('Making transaction_hash nullable...');
    await connection.execute('ALTER TABLE images MODIFY COLUMN transaction_hash VARCHAR(255) NULL');
    console.log('✅ transaction_hash is now nullable');

    // Make amount nullable
    console.log('Making amount nullable...');
    await connection.execute('ALTER TABLE images MODIFY COLUMN amount DECIMAL(10,2) NULL');
    console.log('✅ amount is now nullable');

    console.log('✅ Images table schema updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixImagesTable();
