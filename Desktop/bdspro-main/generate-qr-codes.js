const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Wallet addresses
const addresses = {
  TRC20: 'TTxh7Fv9Npov8rZGYzYzwcUWhQzBEpAtzt',
  BEP20: '0xdfca28ad998742570aecb7ffde1fe564b7d42c30'
};

// Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate QR codes
async function generateQRCodes() {
  try {
    console.log('Generating QR codes...');
    
    for (const [network, address] of Object.entries(addresses)) {
      const filename = `qr-${network.toLowerCase()}.png`;
      const filepath = path.join(publicDir, filename);
      
      // Generate QR code with options
      await QRCode.toFile(filepath, address, {
        type: 'png',
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      console.log(`✅ Generated ${filename} for ${network} address: ${address}`);
    }
    
    console.log('\n🎉 All QR codes generated successfully!');
    console.log('📁 Files saved to: public/');
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend server: cd backend && npm start');
    console.log('2. Start the frontend: npm run dev');
    console.log('3. Visit: http://localhost:3000/payment');
    
  } catch (error) {
    console.error('❌ Error generating QR codes:', error);
  }
}

// Check if qrcode package is installed
try {
  require.resolve('qrcode');
  generateQRCodes();
} catch (error) {
  console.log('📦 Installing QR code generator...');
  console.log('Run: npm install qrcode');
  console.log('Then run: node generate-qr-codes.js');
}
