const { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand, ForgotPasswordCommand, ConfirmForgotPasswordCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const crypto = require('crypto');

/**
 * CORS headers configuration
 *
 * @typedef {Object} CorsHeaders
 * @property {string} Access-Control-Allow-Origin - Allowed origin (default: http://localhost:5173)
 * @property {boolean} Access-Control-Allow-Credentials - Indicates credentials are allowed
 * @property {string} Access-Control-Allow-Headers - Allowed headers: Content-Type,Authorization
 * @property {string} Access-Control-Allow-Methods - Allowed HTTP methods
 *
 * @description Configures CORS headers for all responses. Uses environment variable for origin
 * when available, otherwise defaults to local development origin.
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'https://localhost:5173',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION });
const ssmClient = new SSMClient({ region: process.env.REGION });

// Cache for Cognito client secret
let cognitoClientSecret;

async function getCognitoClientSecret() {
  if (cognitoClientSecret) {
    return cognitoClientSecret;
  }
  
  try {
    const command = new GetParameterCommand({
      Name: '/asic/cognito/appClientSecret',
      WithDecryption: true
    });
    
    const response = await ssmClient.send(command);
    cognitoClientSecret = response.Parameter.Value;
    return cognitoClientSecret;
  } catch (error) {
    console.error('Error retrieving client secret:', error);
    throw new Error('Failed to retrieve authentication credentials');
  }
}

// Generate SECRET_HASH for Cognito
const generateSecretHash = (username, clientSecret) => {
  const message = username + process.env.COGNITO_CLIENT_ID;
  return crypto.createHmac('SHA256', clientSecret)
              .update(message)
              .digest('base64');
};

// Map errors to HTTP responses
const handleError = (error) => {
  const errorMap = {
    UserNotFoundException: { status: 404, message: 'User not found' },
    NotAuthorizedException: { status: 401, message: 'Invalid credentials' },
    UserNotConfirmedException: { status: 403, message: 'User not confirmed' },
    UsernameExistsException: { status: 409, message: 'User already exists' },
    CodeMismatchException: { status: 400, message: 'Invalid verification code' },
    ExpiredCodeException: { status: 400, message: 'Verification code expired' },
    LimitExceededException: { status: 429, message: 'Too many requests' }
  };

  if (errorMap[error.name]) {
    return {
      statusCode: errorMap[error.name].status,
      headers: corsHeaders,
      body: JSON.stringify({ error: errorMap[error.name].message })
    };
  }
  
  return {
    statusCode: 500,
    headers: corsHeaders,
    body: JSON.stringify({ error: 'Authentication failed' })
  };
};

// Handle OPTIONS requests (CORS preflight)
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Add health check endpoint
  if (event.httpMethod === 'GET' && event.path === '/health') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ status: 'ok' })
    };
  }
  
  try {
    const { action } = event.queryStringParameters;
    const body = JSON.parse(event.body);
    
    switch (action) {
      case 'signIn':
        return await handleSignIn(body);
      case 'signUp':
        return await handleSignUp(body);
      case 'confirmSignUp':
        return await handleConfirmSignUp(body);
      case 'resendCode':
        return await handleResendCode(body);
      case 'forgotPassword':
        return await handleForgotPassword(body);
      case 'confirmPassword':
        return await handleConfirmPassword(body);
      default:
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    return handleError(error);
  }
};

async function handleSignIn({ email, password }) {
  const clientSecret = await getCognitoClientSecret();
  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: process.env.COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: generateSecretHash(email, clientSecret)
    }
  };

  const { AuthenticationResult } = await cognitoClient.send(new InitiateAuthCommand(params));
  
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      accessToken: AuthenticationResult.AccessToken,
      idToken: AuthenticationResult.IdToken,
      expiresIn: AuthenticationResult.ExpiresIn
    })
  };
}

async function handleSignUp({ email, password }) {
  const clientSecret = await getCognitoClientSecret();
  const params = {
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [{ Name: 'email', Value: email }],
    SecretHash: generateSecretHash(email, clientSecret)
  };

  await cognitoClient.send(new SignUpCommand(params));
  
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ message: 'Confirmation code sent' })
  };
}

async function handleConfirmSignUp({ email, code }) {
  const clientSecret = await getCognitoClientSecret();
  const params = {
    ClientId: process.env.COGNITO_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    SecretHash: generateSecretHash(email, clientSecret)
  };

  await cognitoClient.send(new ConfirmSignUpCommand(params));
  
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ message: 'User confirmed successfully' })
  };
}

// Other handler functions (resendCode, forgotPassword, confirmPassword) would follow similar pattern