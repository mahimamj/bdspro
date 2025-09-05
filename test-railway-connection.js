// Test Railway database connection
const mysql = require('mysql2/promise');

async function testRailwayConnection() {
    console.log('🧪 Testing Railway Database Connection...\n');

    const connectionString = 'mysql://root:QxNkIyShqDFSigZzxHaxiyZmqtzekoXL@mysql.railway.internal:3306/railway';
    
    try {
        // Parse the connection string
        const url = new URL(connectionString);
        const config = {
            host: url.hostname,
            user: url.username,
            password: url.password,
            database: url.pathname.substring(1),
            port: url.port || 3306,
            ssl: { rejectUnauthorized: false }
        };

        console.log('📡 Connecting to Railway MySQL...');
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected successfully!');

        // Test basic queries
        console.log('\n🔍 Testing database queries...');
        
        // Check if users table exists
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 Available tables:', tables.map(row => Object.values(row)[0]));

        // Check users table structure
        const [userColumns] = await connection.execute('DESCRIBE users');
        console.log('👥 Users table columns:', userColumns.map(col => col.Field));

        // Check if there are any users
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log('👤 Total users in database:', userCount[0].count);

        // Check transactions table
        const [txCount] = await connection.execute('SELECT COUNT(*) as count FROM transactions');
        console.log('💰 Total transactions in database:', txCount[0].count);

        console.log('\n🎉 Railway database connection test successful!');
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('💡 Make sure:');
        console.error('   - Railway MySQL is running');
        console.error('   - Connection string is correct');
        console.error('   - Network allows connections');
    }
}

// Run the test
testRailwayConnection();
