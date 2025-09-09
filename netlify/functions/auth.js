const { handler: registerHandler } = require('./register');
const { handler: loginHandler } = require('./login');
const { handler: profileHandler } = require('./profile');

exports.handler = async (event, context) => {
  const { httpMethod, path, queryStringParameters } = event;
  
  // Route based on query parameters or path
  const action = queryStringParameters?.action || path.split('/').pop();
  
  if (action === 'register' && httpMethod === 'POST') {
    return await registerHandler(event, context);
  } else if (action === 'login' && httpMethod === 'POST') {
    return await loginHandler(event, context);
  } else if (action === 'profile' && httpMethod === 'GET') {
    return await profileHandler(event, context);
  }
  
  // Default to register for POST requests
  if (httpMethod === 'POST') {
    return await registerHandler(event, context);
  }
  
  return {
    statusCode: 404,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      success: false,
      message: 'Not found' 
    })
  };
};
