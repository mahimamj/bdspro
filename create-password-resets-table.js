const mysql = require('mysql2/promise');

async function createPasswordResetsTable() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "hopper.proxy.rlwy.net",
      port: Number(process.env.MYSQL_PORT) || 50359,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "QxNkIyShqDFSigZzxHaxiyZmqtzekoXL",
      database: process.env.MYSQL_DATABASE || "railway"
    });

    console.log('✅ Connected to database successfully!');

    // Create password_resets table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        email VARCHAR(100) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_email (email),
        INDEX idx_expires_at (expires_at)
      )
    `;

    console.log('📋 Creating password_resets table...');
    await connection.execute(createTableSQL);
    console.log('✅ password_resets table created successfully!');

    // Verify table was created
    console.log('🔍 Verifying table creation...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'password_resets'");
    
    if (tables.length > 0) {
      console.log('✅ Table verification successful!');
      
      // Show table structure
      const [columns] = await connection.execute("DESCRIBE password_resets");
      console.log('\n📊 Table Structure:');
      console.table(columns);
    } else {
      console.log('❌ Table verification failed!');
    }

  } catch (error) {
    console.error('❌ Error creating password_resets table:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Database connection failed. Please check:');
      console.log('   - Database credentials in .env.local');
      console.log('   - Network connectivity');
      console.log('   - Database server status');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('\n💡 Users table not found. Please ensure the main database schema is created first.');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed.');
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Starting password_resets table creation...');
console.log('📧 This table is required for email password reset functionality\n');

createPasswordResetsTable()
  .then(() => {
    console.log('\n🎉 Setup complete! Your email password reset system is ready.');
    console.log('📝 Next steps:');
    console.log('   1. Set up your Gmail App Password');
    console.log('   2. Update .env.local with your email credentials');
    console.log('   3. Test the forgot password functionality');
  })
  .catch((error) => {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  });
