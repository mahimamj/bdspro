#!/usr/bin/env node

/**
 * Google OAuth Setup Helper Script
 * This script helps you configure Google OAuth credentials
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Google OAuth Setup Helper');
console.log('============================\n');

console.log('📋 Before running this script, make sure you have:');
console.log('1. Created a Google Cloud Project');
console.log('2. Enabled Google+ API');
console.log('3. Created OAuth 2.0 credentials');
console.log('4. Got your Client ID and Client Secret\n');

const questions = [
  {
    key: 'GOOGLE_CLIENT_ID',
    prompt: 'Enter your Google Client ID: ',
    validate: (value) => value.includes('.apps.googleusercontent.com')
  },
  {
    key: 'GOOGLE_CLIENT_SECRET',
    prompt: 'Enter your Google Client Secret: ',
    validate: (value) => value.startsWith('GOCSPX-')
  },
  {
    key: 'SESSION_SECRET',
    prompt: 'Enter a strong session secret (or press Enter to generate): ',
    validate: () => true,
    generate: () => require('crypto').randomBytes(32).toString('base64')
  }
];

const envContent = {
  'PORT': '5000',
  'NODE_ENV': 'development',
  'DB_HOST': 'localhost',
  'DB_USER': 'root',
  'DB_PASSWORD': 'your_password',
  'DB_NAME': 'bds_pro',
  'JWT_SECRET': 'your_jwt_secret_here',
  'CORS_ORIGIN': 'http://localhost:3000',
  'FRONTEND_URL': 'http://localhost:3000',
  'GOOGLE_CALLBACK_URL': 'http://localhost:5000/api/auth/google/callback'
};

let currentQuestion = 0;

function askQuestion() {
  if (currentQuestion >= questions.length) {
    writeEnvFile();
    return;
  }

  const question = questions[currentQuestion];
  
  rl.question(question.prompt, (answer) => {
    let value = answer.trim();
    
    // Generate session secret if empty
    if (question.key === 'SESSION_SECRET' && !value) {
      value = question.generate();
      console.log(`✅ Generated session secret: ${value}`);
    }
    
    // Validate the answer
    if (value && question.validate && !question.validate(value)) {
      console.log('❌ Invalid format. Please try again.\n');
      askQuestion();
      return;
    }
    
    if (value) {
      envContent[question.key] = value;
      console.log('✅ Added successfully!\n');
    }
    
    currentQuestion++;
    askQuestion();
  });
}

function writeEnvFile() {
  const backendPath = path.join(__dirname, 'backend', '.env');
  
  const envString = Object.entries(envContent)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  try {
    fs.writeFileSync(backendPath, envString);
    console.log('🎉 Environment file created successfully!');
    console.log(`📁 Location: ${backendPath}\n`);
    
    console.log('📋 Next steps:');
    console.log('1. Restart your backend server');
    console.log('2. Test Google OAuth at http://localhost:3000/login');
    console.log('3. Click "Continue with Google" button\n');
    
    console.log('🔗 If you need help, check: GOOGLE_OAUTH_API_KEY_GUIDE.md');
    
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
  
  rl.close();
}

// Start the setup process
askQuestion();
