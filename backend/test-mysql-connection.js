const mysql = require('mysql2/promise');
require('dotenv').config();

async function testMySQLConnection() {
    console.log('🔍 Testing MySQL connection...');
    console.log('Configuration:');
    console.log(`  Host: ${process.env.DB_HOST}`);
    console.log(`  User: ${process.env.DB_USER}`);
    console.log(`  Password: ${process.env.DB_PASSWORD || '(empty)'}`);
    console.log(`  Database: ${process.env.DB_NAME}`);
    console.log(`  Port: ${process.env.DB_PORT}`);
    console.log('');

    try {
        // Test connection to MySQL server (without specific database)
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Successfully connected to MySQL server!');
        
        // Test creating database
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
        console.log(`✅ Database '${process.env.DB_NAME}' created/verified`);
        
        await connection.end();
        console.log('🎉 MySQL connection test successful!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Run: node scripts/initDatabase.js');
        console.log('2. Run: npm start');
        
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        console.log('');
        console.log('Troubleshooting:');
        console.log('1. Make sure XAMPP is running');
        console.log('2. Start MySQL service in XAMPP Control Panel');
        console.log('3. Check if MySQL is running on port 3306');
        console.log('4. If you have a MySQL password, update DB_PASSWORD in .env file');
        console.log('');
        console.log('To check if MySQL is running:');
        console.log('- Open XAMPP Control Panel');
        console.log('- Look for MySQL service');
        console.log('- Click "Start" if not running');
        console.log('- Should show "Running" status');
    }
}

testMySQLConnection();
