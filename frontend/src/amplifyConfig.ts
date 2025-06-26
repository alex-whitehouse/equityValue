import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      authenticationFlowType: 'USER_PASSWORD_AUTH',
    }
  }
};

Amplify.configure(amplifyConfig);

export default amplifyConfig;