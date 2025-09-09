const mysql = require('mysql2/promise');

async function fixColumnNames() {
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

    // Check current table structures
    console.log('🔍 Checking current table structures...');
    
    const tablesToCheck = [
      'users',
      'transactions', 
      'referrals',
      'network',
      'deposits',
      'investments',
      'earnings',
      'business_tracking',
      'password_resets'
    ];

    for (const tableName of tablesToCheck) {
      try {
        console.log(`\n📋 Checking table: ${tableName}`);
        
        // Check if table exists
        const [tables] = await connection.execute(`SHOW TABLES LIKE '${tableName}'`);
        
        if (tables.length === 0) {
          console.log(`⚠️  Table ${tableName} does not exist, skipping...`);
          continue;
        }

        // Get table structure
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        
        // Check for timestamp columns
        const timestampColumns = columns.filter(col => 
          col.Field === 'timestamp' || col.Field === 'created_at'
        );
        
        console.log(`   Found timestamp columns:`, timestampColumns.map(col => col.Field));
        
        // Determine what the column should be named based on table type
        let expectedColumnName;
        if (tableName === 'transactions') {
          expectedColumnName = 'timestamp';
        } else {
          expectedColumnName = 'created_at';
        }
        
        // Check if we need to rename any columns
        const hasTimestamp = columns.some(col => col.Field === 'timestamp');
        const hasCreatedAt = columns.some(col => col.Field === 'created_at');
        
        if (expectedColumnName === 'created_at' && hasTimestamp && !hasCreatedAt) {
          console.log(`   🔄 Renaming 'timestamp' to 'created_at' in ${tableName}...`);
          await connection.execute(`ALTER TABLE ${tableName} CHANGE COLUMN timestamp created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
          console.log(`   ✅ Renamed 'timestamp' to 'created_at' in ${tableName}`);
        } else if (expectedColumnName === 'timestamp' && hasCreatedAt && !hasTimestamp) {
          console.log(`   🔄 Renaming 'created_at' to 'timestamp' in ${tableName}...`);
          await connection.execute(`ALTER TABLE ${tableName} CHANGE COLUMN created_at timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
          console.log(`   ✅ Renamed 'created_at' to 'timestamp' in ${tableName}`);
        } else {
          console.log(`   ✅ Table ${tableName} already has correct column name: ${expectedColumnName}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error checking table ${tableName}:`, error.message);
      }
    }

    console.log('\n🎉 Column name fix completed!');
    console.log('\n📊 Summary of expected column names:');
    console.log('   Tables using "created_at": users, referrals, network, deposits, investments, earnings, business_tracking, password_resets');
    console.log('   Tables using "timestamp": transactions');

  } catch (error) {
    console.error('❌ Error fixing column names:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Database connection failed. Please check:');
      console.log('   - Database credentials in .env.local');
      console.log('   - Network connectivity');
      console.log('   - Database server status');
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

console.log('🚀 Starting database column name fix...');
console.log('🔧 This will ensure consistent column naming across all tables\n');

fixColumnNames()
  .then(() => {
    console.log('\n✅ All column names have been standardized!');
    console.log('📝 Next steps:');
    console.log('   1. Test your application to ensure everything works');
    console.log('   2. Check that all API endpoints are working correctly');
  })
  .catch((error) => {
    console.error('\n💥 Fix failed:', error.message);
    process.exit(1);
  });
