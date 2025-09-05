// Test script to verify database functionality
const { db } = require('./app/api/database');

async function testDatabaseFunctionality() {
    console.log('🧪 Testing Database Functionality...\n');

    try {
        // Test 1: Database Connection
        console.log('1️⃣ Testing database connection...');
        const isConnected = await db.testConnection();
        if (isConnected) {
            console.log('✅ Database connection successful\n');
        } else {
            console.log('❌ Database connection failed\n');
            return;
        }

        // Test 2: Create Test User
        console.log('2️⃣ Testing user creation...');
        const testUser = {
            name: 'Test User',
            email: 'test@example.com',
            password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8.8.8.8', // bcrypt hash for 'password123'
            referral_code: 'TEST123',
            referrer_id: null
        };

        const createResult = await db.createUser(testUser);
        if (createResult.success) {
            console.log('✅ User created successfully with ID:', createResult.user_id);
        } else {
            console.log('❌ User creation failed:', createResult.error);
        }

        // Test 3: Find User by Email
        console.log('\n3️⃣ Testing user lookup by email...');
        const foundUser = await db.findUserByEmail('test@example.com');
        if (foundUser) {
            console.log('✅ User found:', {
                id: foundUser.user_id,
                name: foundUser.name,
                email: foundUser.email,
                referral_code: foundUser.referral_code
            });
        } else {
            console.log('❌ User not found');
        }

        // Test 4: Find User by ID
        console.log('\n4️⃣ Testing user lookup by ID...');
        if (createResult.success) {
            const userById = await db.findUserById(createResult.user_id);
            if (userById) {
                console.log('✅ User found by ID:', {
                    id: userById.user_id,
                    name: userById.name,
                    email: userById.email
                });
            } else {
                console.log('❌ User not found by ID');
            }
        }

        // Test 5: Test Password Hashing (simulation)
        console.log('\n5️⃣ Testing password hashing...');
        const bcrypt = require('bcryptjs');
        const testPassword = 'password123';
        const hashedPassword = await bcrypt.hash(testPassword, 12);
        const isValidPassword = await bcrypt.compare(testPassword, hashedPassword);
        
        if (isValidPassword) {
            console.log('✅ Password hashing and verification working');
        } else {
            console.log('❌ Password hashing failed');
        }

        // Test 6: Test Transactions Query
        console.log('\n6️⃣ Testing transactions query...');
        try {
            const [rows] = await db.pool.execute('SELECT COUNT(*) as count FROM transactions');
            console.log('✅ Transactions table accessible, count:', rows[0].count);
        } catch (error) {
            console.log('⚠️ Transactions table not accessible:', error.message);
        }

        // Test 7: Test Referrals Query
        console.log('\n7️⃣ Testing referrals query...');
        try {
            const [rows] = await db.pool.execute('SELECT COUNT(*) as count FROM referrals');
            console.log('✅ Referrals table accessible, count:', rows[0].count);
        } catch (error) {
            console.log('⚠️ Referrals table not accessible:', error.message);
        }

        console.log('\n🎉 Database functionality test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        // Close database connection
        await db.pool.end();
    }
}

// Run the test
testDatabaseFunctionality();
