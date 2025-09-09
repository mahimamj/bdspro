const jwt = require('jsonwebtoken');

// Test token verification
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZGVtb191c2VyXzEyMyIsIm5hbWUiOiJEZW1vIFVzZXIiLCJlbWFpbCI6ImRlbW9AZXhhbXBsZS5jb20iLCJhY2NvdW50X2JhbGFuY2UiOjEwMDAsInRvdGFsX2Vhcm5pbmciOjUwMCwicmV3YXJkcyI6NTAsImlhdCI6MTc1Njk0NDY4OSwiZXhwIjoxNzU3MDMxMDg5fQ.OLucnbir4zVn5IjBAOYaLlKqNVaNk-ULU2QdTVsgEt8';
const secret = process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development';

try {
  const decoded = jwt.verify(token, secret);
  console.log('Token is valid!');
  console.log('Decoded payload:', decoded);
} catch (error) {
  console.log('Token verification failed:', error.message);
}
