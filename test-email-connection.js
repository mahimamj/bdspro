const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmailConnection() {
  console.log('🧪 Testing Email Connection...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables Check:');
  console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
  console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
  console.log('   EMAIL_FROM:', process.env.EMAIL_FROM ? '✅ Set' : '❌ Missing');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n❌ Email configuration is missing!');
    console.log('📝 Please create a .env.local file with:');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASS=your-16-character-app-password');
    console.log('   EMAIL_FROM=BDS PRO <noreply@bdspro.com>');
    return;
  }
  
  try {
    console.log('\n🔌 Creating email transporter...');
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    console.log('✅ Transporter created successfully!');
    
    // Verify connection
    console.log('\n🔍 Verifying email connection...');
    await transporter.verify();
    console.log('✅ Email connection verified successfully!');
    
    // Send test email
    console.log('\n📧 Sending test email...');
    const testEmail = {
      from: process.env.EMAIL_FROM || 'BDS PRO <noreply@bdspro.com>',
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'BDS PRO - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">BDS PRO</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Email Test Successful!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">🎉 Congratulations!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Your email configuration is working perfectly! This means:
            </p>
            
            <ul style="color: #666; line-height: 1.6;">
              <li>✅ Email service is properly configured</li>
              <li>✅ Gmail App Password is working</li>
              <li>✅ Password reset emails will be sent successfully</li>
              <li>✅ Your BDS PRO application is ready!</li>
            </ul>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Next Steps:</h3>
              <ol style="color: #666; line-height: 1.6;">
                <li>Test the forgot password functionality on your website</li>
                <li>Check your email for password reset links</li>
                <li>Deploy your application to production</li>
              </ol>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2024 BDS PRO. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `
        BDS PRO - Email Test Successful!
        
        Congratulations! Your email configuration is working perfectly.
        
        This means:
        - Email service is properly configured
        - Gmail App Password is working
        - Password reset emails will be sent successfully
        - Your BDS PRO application is ready!
        
        Next Steps:
        1. Test the forgot password functionality on your website
        2. Check your email for password reset links
        3. Deploy your application to production
        
        © 2024 BDS PRO. All rights reserved.
      `
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('   Message ID:', result.messageId);
    console.log('   Response:', result.response);
    
    console.log('\n🎉 Email test completed successfully!');
    console.log('📧 Check your inbox for the test email.');
    console.log('🚀 Your password reset functionality should now work!');
    
  } catch (error) {
    console.error('\n❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('   1. Your Gmail email address is correct');
      console.log('   2. You\'re using an App Password (not your regular password)');
      console.log('   3. 2-Factor Authentication is enabled on your Google account');
      console.log('\n📝 To get an App Password:');
      console.log('   1. Go to https://myaccount.google.com/security');
      console.log('   2. Enable 2-Factor Authentication');
      console.log('   3. Go to App passwords');
      console.log('   4. Generate a new app password for "Mail"');
      console.log('   5. Use the 16-character password in your .env.local file');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n💡 Connection failed. Please check:');
      console.log('   1. Your internet connection');
      console.log('   2. Gmail servers are accessible');
    } else {
      console.log('\n💡 Error details:', error);
    }
  }
}

console.log('🚀 Starting BDS PRO Email Test...\n');
testEmailConnection();