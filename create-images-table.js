const mysql = require('mysql2/promise');

async function createImagesTable() {
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

    // Create images table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        referred_id INT NOT NULL,
        referrer_id INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        transaction_hash VARCHAR(255),
        amount DECIMAL(10,2),
        status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (referred_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (referrer_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_referred_id (referred_id),
        INDEX idx_referrer_id (referrer_id),
        INDEX idx_status (status)
      )
    `;

    await connection.execute(createTableQuery);
    console.log('✅ Images table created successfully!');

    // Create uploads directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Uploads directory created successfully!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createImagesTable();
