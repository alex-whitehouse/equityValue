const { CognitoIdentityProviderClient, SignUpCommand } = require('@aws-sdk/client-cognito-identity-provider');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from frontend/.env.production
dotenv.config({ path: path.resolve(__dirname, 'frontend', '.env.production') });

const client = new CognitoIdentityProviderClient({ region: 'eu-west-2' });

function calculateSecretHash(clientId, clientSecret, username) {
  const hmac = crypto.createHmac('sha256', clientSecret);
  hmac.update(username + clientId);
  return hmac.digest('base64');
}

async function testSignup() {
  try {
    const command = new SignUpCommand({
      ClientId: process.env.VITE_USER_POOL_CLIENT_ID,
      SecretHash: calculateSecretHash(
        process.env.VITE_USER_POOL_CLIENT_ID,
        process.env.VITE_USER_POOL_CLIENT_SECRET,
        'test@example.com'
      ),
      Username: 'test@example.com',
      Password: 'TestPassword123!',
      UserAttributes: [
        { Name: 'email', Value: 'test@example.com' }
      ]
    });

    const result = await client.send(command);
    console.log('Signup result:', result);
    console.log('User created successfully. Check Cognito User Pool for verification.');
  } catch (error) {
    console.error('Signup failed:', error);
  }
}

testSignup();