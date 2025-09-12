const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bds_pro',
  multipleStatements: true
};

async function initializeDatabase() {
  let connection;
  
  try {
    console.log('🔧 Initializing BDS PRO Database...');
    
    // Connect to MySQL server (without specific database)
    const serverConfig = { ...dbConfig };
    delete serverConfig.database;
    
    connection = await mysql.createConnection(serverConfig);
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log(`✅ Database '${dbConfig.database}' created/verified`);
    
    // Switch to the database
    await connection.execute(`USE \`${dbConfig.database}\``);
    
    // Read and execute schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✅ Executed SQL statement');
        } catch (error) {
          if (error.code !== 'ER_TABLE_EXISTS_ERROR' && error.code !== 'ER_DUP_KEYNAME') {
            console.error('❌ SQL Error:', error.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
          }
        }
      }
    }
    
    console.log('🎉 Database initialization completed successfully!');
    
    // Verify tables were created
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 Created tables:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // Show system settings
    const [settings] = await connection.execute('SELECT * FROM system_settings');
    console.log('\n⚙️ System settings:');
    settings.forEach(setting => {
      console.log(`  - ${setting.setting_key}: ${setting.setting_value}`);
    });
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('\n✅ Database setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
