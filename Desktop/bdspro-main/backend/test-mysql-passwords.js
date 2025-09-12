const mysql = require('mysql2/promise');
require('dotenv').config();

const passwords = ['', 'root', 'password', 'admin', '123456'];

async function testPasswords() {
    for (const password of passwords) {
        try {
            console.log(`Testing password: "${password}"`);
            const connection = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: password,
                database: 'bds_pro_db',
                port: 3307
            });
            
            console.log(`✅ SUCCESS! Password is: "${password}"`);
            await connection.end();
            return password;
        } catch (error) {
            console.log(`❌ Failed with password: "${password}" - ${error.message}`);
        }
    }
    console.log('❌ No password worked');
    return null;
}

testPasswords().then(password => {
    if (password !== null) {
        console.log(`\n🎯 Use this password in your .env file:`);
        console.log(`DB_PASSWORD=${password}`);
    }
    process.exit(0);
});
