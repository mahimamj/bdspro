const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const setupDatabase = async () => {
    let connection;
    
    try {
        // Create database first (connect without specifying database)
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log('✅ Connected to MySQL server');

        // Create database first
        console.log('📊 Creating database...');
        await connection.execute('CREATE DATABASE IF NOT EXISTS bds_pro_db');
        
        // Close connection and reconnect to the specific database
        await connection.end();
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            database: 'bds_pro_db',
            multipleStatements: true
        });

        // Read and execute clean schema
        const schemaPath = path.join(__dirname, 'database', 'clean-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📄 Executing database schema...');
        
        // Split schema into individual statements and execute them one by one
        const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement.trim() + ';');
            }
        }
        
        console.log('✅ Database setup completed successfully!');
        console.log('📊 Database: bds_pro_db');
        console.log('👥 Sample users created');
        console.log('📈 Sample data inserted');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Please check your database credentials in .env file');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('💡 Please make sure MySQL server is running');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

setupDatabase();
