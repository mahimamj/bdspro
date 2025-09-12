const jwt = require('jsonwebtoken');

// Test different JWT secrets
const secrets = [
  'demo_jwt_secret_key_for_development',
  'demo_jwt_secret',
  'your_jwt_secret',
  'bds_pro_jwt_secret'
];

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZGVtb191c2VyXzEyMyIsIm5hbWUiOiJEZW1vIFVzZXIiLCJlbWFpbCI6ImRlbW9AZXhhbXBsZS5jb20iLCJhY2NvdW50X2JhbGFuY2UiOjEwMDAsInRvdGFsX2Vhcm5pbmciOjUwMCwicmV3YXJkcyI6NTAsImlhdCI6MTc1Njk0NDY4OSwiZXhwIjoxNzU3MDMxMDg5fQ.OLucnbir4zVn5IjBAOYaLlKqNVaNk-ULU2QdTVsgEt8';

console.log('Testing token with different secrets:');
secrets.forEach((secret, index) => {
  try {
    const decoded = jwt.verify(token, secret);
    console.log(`✅ Secret ${index + 1} (${secret}): VALID`);
    console.log('   Decoded:', decoded);
  } catch (error) {
    console.log(`❌ Secret ${index + 1} (${secret}): INVALID - ${error.message}`);
  }
});
