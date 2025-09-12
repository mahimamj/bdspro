const mysql = require('mysql2/promise');

async function testMySQLSimple() {
    console.log('🔍 Testing MySQL connection with different configurations...');
    
    // Try different configurations
    const configs = [
        { name: 'No password, no database', config: { host: 'localhost', user: 'root', port: 3306 } },
        { name: 'No password, with database', config: { host: 'localhost', user: 'root', port: 3306, database: 'bds_pro_db' } },
        { name: 'Empty password', config: { host: 'localhost', user: 'root', password: '', port: 3306 } },
        { name: 'Common XAMPP password', config: { host: 'localhost', user: 'root', password: '', port: 3306 } }
    ];
    
    for (const { name, config } of configs) {
        try {
            console.log(`\n🔄 Trying: ${name}`);
            const connection = await mysql.createConnection(config);
            console.log(`✅ Success with: ${name}`);
            
            // Test creating database
            if (!config.database) {
                await connection.execute('CREATE DATABASE IF NOT EXISTS `bds_pro_db`');
                console.log('✅ Database created successfully');
            }
            
            await connection.end();
            console.log('🎉 Connection successful!');
            return config;
            
        } catch (error) {
            console.log(`❌ Failed: ${name} - ${error.message}`);
        }
    }
    
    console.log('\n❌ All connection attempts failed');
    console.log('\nPlease check:');
    console.log('1. XAMPP MySQL is running');
    console.log('2. Try opening http://localhost/phpmyadmin in browser');
    console.log('3. Check if you can login to phpMyAdmin');
    console.log('4. If phpMyAdmin works, note the password used');
}

testMySQLSimple();
