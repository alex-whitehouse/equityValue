const config = {
  Auth: {
    region: import.meta.env.VITE_USER_POOL_ID?.split('_')[0],
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
      loginWith: {
        email: true
      }
    }
  }
};

export default config;