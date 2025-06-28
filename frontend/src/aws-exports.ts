const config = {
  Auth: {
    region: import.meta.env.VITE_USER_POOL_ID?.split('_')[0],
    userPoolId: import.meta.env.VITE_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID
  }
};

export default config;