const { CognitoJwtVerifier } = require('aws-jwt-verify');

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  tokenUse: 'id',
  clientId: process.env.COGNITO_CLIENT_ID
});

module.exports.handler = async (event) => {
  try {
    const token = event.headers.Authorization?.split(' ')[1];
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized: Missing token' })
      };
    }

    const payload = await verifier.verify(token);
    event.user = payload;
    return event;
    
  } catch (error) {
    console.error('JWT verification failed:', error);
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized: Invalid token' })
    };
  }
};