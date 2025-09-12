const fetch = require('node-fetch');

async function testReferralRegistration() {
  try {
    console.log('=== TESTING REFERRAL REGISTRATION ===');
    
    // Test user registration with Mahima's referral code
    const testUser = {
      name: 'Test Friend',
      email: 'testfriend@example.com',
      password: 'TestPassword123',
      confirmPassword: 'TestPassword123',
      referralCode: 'BDSJXFY952' // Mahima's referral code
    };
    
    console.log('Testing with user data:', testUser);
    console.log('Using referral code:', testUser.referralCode);
    
    const response = await fetch('https://bdspro-fawn.vercel.app/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('✅ Registration successful!');
      console.log('User data:', result.data.user);
      console.log('Referral info:', result.data.referralInfo);
    } else {
      console.log('❌ Registration failed:', result.error || result.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing registration:', error.message);
  }
}

testReferralRegistration();
