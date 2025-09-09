const fs = require('fs');
const path = require('path');

function setupEmailConfiguration() {
  console.log('🚀 BDS PRO Email Setup Wizard\n');
  
  const envPath = path.join(__dirname, '.env.local');
  
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('📋 Found existing .env.local file');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    if (envContent.includes('EMAIL_USER') && envContent.includes('EMAIL_PASS')) {
      console.log('✅ Email configuration already exists in .env.local');
      console.log('📝 Current email configuration:');
      
      const lines = envContent.split('\n');
      lines.forEach(line => {
        if (line.startsWith('EMAIL_')) {
          const [key, value] = line.split('=');
          if (key === 'EMAIL_PASS') {
            console.log(`   ${key}=${value ? '***hidden***' : 'NOT SET'}`);
          } else {
            console.log(`   ${key}=${value || 'NOT SET'}`);
          }
        }
      });
      
      console.log('\n🧪 To test your email configuration, run:');
      console.log('   node test-email-connection.js');
      
      return;
    }
  }
  
  // Create .env.local file
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# Database Configuration
MYSQL_HOST=hopper.proxy.rlwy.net
MYSQL_PORT=50359
MYSQL_USER=root
MYSQL_PASSWORD=QxNkIyShqDFSigZzxHaxiyZmqtzekoXL
MYSQL_DATABASE=railway

# JWT Configuration
JWT_SECRET=demo_jwt_secret_key_for_development

# Email Configuration (REQUIRED FOR PASSWORD RESET)
# Replace these with your actual Gmail credentials
EMAIL_USER=joshimahima798@gmail.com
EMAIL_PASS=your-16-character-app-password-here
EMAIL_FROM=BDS PRO <noreply@bdspro.com>

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created successfully!');
  
  console.log('\n📧 Next Steps:');
  console.log('1. Get your Gmail App Password:');
  console.log('   - Go to https://myaccount.google.com/security');
  console.log('   - Enable 2-Factor Authentication');
  console.log('   - Go to App passwords → Generate new password');
  console.log('   - Select "Mail" and copy the 16-character password');
  
  console.log('\n2. Update your .env.local file:');
  console.log('   - Open .env.local in your editor');
  console.log('   - Replace "your-16-character-app-password-here" with your actual App Password');
  
  console.log('\n3. Test your email configuration:');
  console.log('   node test-email-connection.js');
  
  console.log('\n4. Start your application:');
  console.log('   npm run dev');
  
  console.log('\n🎉 Once configured, your password reset emails will work!');
}

setupEmailConfiguration();
