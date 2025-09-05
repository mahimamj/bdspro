const { handler: registerHandler } = require('./register');
const { handler: loginHandler } = require('./login');
const { handler: profileHandler } = require('./profile');

exports.handler = async (event, context) => {
  const { httpMethod, path } = event;
  
  // Route based on path
  if (path === '/api/auth/register' && httpMethod === 'POST') {
    return await registerHandler(event, context);
  } else if (path === '/api/auth/login' && httpMethod === 'POST') {
    return await loginHandler(event, context);
  } else if (path === '/api/auth/profile' && httpMethod === 'GET') {
    return await profileHandler(event, context);
  }
  
  return {
    statusCode: 404,
    body: JSON.stringify({ message: 'Not found' })
  };
};
