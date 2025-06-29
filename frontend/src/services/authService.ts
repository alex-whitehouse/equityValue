import CryptoJS from 'crypto-js';
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode as amplifyResendSignUpCode,
  resetPassword as amplifyResetPassword,
  confirmResetPassword as amplifyConfirmResetPassword,
  signOut as amplifySignOut,
  fetchAuthSession,
  getCurrentUser
} from 'aws-amplify/auth';

// Map Cognito errors to user-friendly messages
const mapCognitoError = (error: any): Error => {
  if (!error.name) {
    console.warn('[AuthService] Unknown error without name:', error);
    return error;
  }
  
  const errorMap: Record<string, string> = {
    UserNotFoundException: 'User not found',
    NotAuthorizedException: 'Incorrect username or password',
    UserNotConfirmedException: 'Please verify your email first',
    UsernameExistsException: 'Email already registered',
    InvalidPasswordException: 'Password must contain uppercase, number, and special character',
    InvalidParameterException: 'Invalid email format',
    CodeMismatchException: 'Invalid verification code',
    ExpiredCodeException: 'Verification code has expired',
    LimitExceededException: 'Too many attempts. Please try again later',
  };

  const message = errorMap[error.name] || 'Authentication failed';
  console.error(`[AuthService] CognitoError: ${error.name} -> ${message}`, error);
  
  return new Error(message);
};

interface AuthResponse {
  accessToken: string;
  idToken: string;
  expiresIn: number;
}

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.debug(`[AuthService] SignIn initiated for: ${email}`);
    // Verify environment variables
    const clientId = import.meta.env.VITE_USER_POOL_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_USER_POOL_CLIENT_SECRET;
    
    console.debug('[AuthService] Environment variables:', {
      VITE_USER_POOL_CLIENT_ID: clientId,
      VITE_USER_POOL_CLIENT_SECRET: clientSecret ? '***' : 'MISSING'
    });
    
    if (!clientId) {
      console.error('[AuthService] Client ID is missing!');
    }
    
    if (!clientSecret) {
      console.warn('[AuthService] Client secret missing - SECRET_HASH will not be generated');
    } else {
      console.debug('[AuthService] Using client secret to generate SECRET_HASH');
    }
    
    // Generate SECRET_HASH using HMAC-SHA256
    const message = email + clientId;
    const hash = CryptoJS.HmacSHA256(message, clientSecret);
    const secretHash = CryptoJS.enc.Base64.stringify(hash);
    
    // Prepare options with clientMetadata containing SECRET_HASH
    const options = {
      clientMetadata: {
        ...(clientSecret ? { SECRET_HASH: secretHash } : {})
      }
    } as any; // Type assertion to bypass SignInOptions limitations
    
    console.debug('[AuthService] AmplifySignIn payload', {
      username: email,
      options: {
        ...options,
        clientMetadata: options.clientMetadata
          ? { ...options.clientMetadata, SECRET_HASH: '***' }
          : undefined
      }
    });

    const { isSignedIn, nextStep } = await amplifySignIn({
      username: email,
      password,
      options
    });
    
    if (!isSignedIn) {
      console.warn(`[AuthService] SignIn requires further steps: ${nextStep?.signInStep}`);
      throw new Error(`Sign-in requires further steps: ${nextStep?.signInStep}`);
    }
    
    const session = await fetchAuthSession();
    console.debug('[AuthService] AuthSession fetched', {
      accessToken: session.tokens?.accessToken?.toString().slice(0, 10) + '...',
      idToken: session.tokens?.idToken?.toString().slice(0, 10) + '...',
      expiresAt: session.tokens?.accessToken?.payload.exp
    });
    
    const accessToken = session.tokens?.accessToken?.toString() || '';
    const idToken = session.tokens?.idToken?.toString() || '';
    const expiresAt = session.tokens?.accessToken?.payload.exp || 0;
    
    return {
      accessToken,
      idToken,
      expiresIn: expiresAt
    };
  } catch (error) {
    console.error('[AuthService] SignIn error:', error);
    throw mapCognitoError(error);
  }
};

export const signUp = async (email: string, password: string): Promise<string> => {
  try {
    console.debug('[AuthService] SignUp initiated', { email });
    const clientId = import.meta.env.VITE_USER_POOL_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_USER_POOL_CLIENT_SECRET;
    
    console.debug('[AuthService] Environment variables:', {
      VITE_USER_POOL_CLIENT_ID: clientId,
      VITE_USER_POOL_CLIENT_SECRET: clientSecret ? '***' : 'MISSING'
    });
    
    if (!clientSecret) {
      console.warn('[AuthService] Client secret missing - SECRET_HASH will not be generated');
    } else {
      console.debug('[AuthService] Using client secret to generate SECRET_HASH');
    }
    
    // Generate SECRET_HASH using HMAC-SHA256
    const message = email + clientId;
    const hash = CryptoJS.HmacSHA256(message, clientSecret);
    const secretHash = CryptoJS.enc.Base64.stringify(hash);
    
    // Prepare options with clientMetadata containing SECRET_HASH
    const options = {
      userAttributes: { email },
      clientMetadata: {
        ...(clientSecret ? { SECRET_HASH: secretHash } : {})
      }
    } as any; // Type assertion to bypass SignUpOptions limitations
    
    console.debug('[AuthService] AmplifySignUp payload', {
      username: email,
      options: {
        ...options,
        clientMetadata: options.clientMetadata
          ? { ...options.clientMetadata, SECRET_HASH: '***' }
          : undefined
      }
    });

    const result = await amplifySignUp({
      username: email,
      password,
      options
    });
    
    console.debug('[AuthService] SignUp response', result);
    return result.userId || '';
  } catch (error) {
    console.error('[AuthService] SignUp error:', error);
    throw mapCognitoError(error);
  }
};

export const confirmSignUp = async (email: string, code: string): Promise<void> => {
  try {
    console.debug('[AuthService] ConfirmSignUp initiated', { email });
    const clientId = import.meta.env.VITE_USER_POOL_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_USER_POOL_CLIENT_SECRET;
    
    const options = {
      clientMetadata: {}
    } as any;
    if (clientSecret) {
      // Generate SECRET_HASH using HMAC-SHA256
      const message = email + clientId;
      const hash = CryptoJS.HmacSHA256(message, clientSecret);
      const secretHash = CryptoJS.enc.Base64.stringify(hash);
      options.clientMetadata.SECRET_HASH = secretHash;
    }

    console.debug('[AuthService] AmplifyConfirmSignUp payload', {
      username: email,
      options: {
        ...options,
        ...(options.secretHash ? { secretHash: '***' } : {}) // Mask secretHash in logs
      }
    });

    await amplifyConfirmSignUp({
      username: email,
      confirmationCode: code,
      options
    });
    console.debug('[AuthService] ConfirmSignUp success');
  } catch (error) {
    console.error('[AuthService] ConfirmSignUp error:', error);
    throw mapCognitoError(error);
  }
};

export const resendSignUpCode = async (email: string): Promise<void> => {
  try {
    console.debug('[AuthService] ResendSignUpCode initiated', { email });
    const clientId = import.meta.env.VITE_USER_POOL_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_USER_POOL_CLIENT_SECRET;
    
    const options = {
      clientMetadata: {}
    } as any;
    if (clientSecret) {
      // Generate SECRET_HASH using HMAC-SHA256
      const message = email + clientId;
      const hash = CryptoJS.HmacSHA256(message, clientSecret);
      const secretHash = CryptoJS.enc.Base64.stringify(hash);
      options.clientMetadata.SECRET_HASH = secretHash;
    }

    console.debug('[AuthService] AmplifyResendSignUpCode payload', {
      username: email,
      options: {
        ...options,
        ...(options.secretHash ? { secretHash: '***' } : {}) // Mask secretHash in logs
      }
    });

    await amplifyResendSignUpCode({
      username: email,
      options
    });
    console.debug('[AuthService] ResendSignUpCode success');
  } catch (error) {
    console.error('[AuthService] ResendSignUpCode error:', error);
    throw mapCognitoError(error);
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    console.debug('[AuthService] ForgotPassword initiated', { email });
    const clientId = import.meta.env.VITE_USER_POOL_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_USER_POOL_CLIENT_SECRET;
    
    const options = {
      clientMetadata: {}
    } as any;
    if (clientSecret) {
      // Generate SECRET_HASH using HMAC-SHA256
      const message = email + clientId;
      const hash = CryptoJS.HmacSHA256(message, clientSecret);
      const secretHash = CryptoJS.enc.Base64.stringify(hash);
      options.clientMetadata.SECRET_HASH = secretHash;
    }

    console.debug('[AuthService] AmplifyResetPassword payload', {
      username: email,
      options: {
        ...options,
        ...(options.secretHash ? { secretHash: '***' } : {}) // Mask secretHash in logs
      }
    });

    await amplifyResetPassword({
      username: email,
      options
    });
    console.debug('[AuthService] ForgotPassword success');
  } catch (error) {
    console.error('[AuthService] ForgotPassword error:', error);
    throw mapCognitoError(error);
  }
};

export const resetPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
  try {
    console.debug('[AuthService] ResetPassword initiated', { email });
    const clientId = import.meta.env.VITE_USER_POOL_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_USER_POOL_CLIENT_SECRET;
    
    const options = {
      clientMetadata: {}
    } as any;
    if (clientSecret) {
      // Generate SECRET_HASH using HMAC-SHA256
      const message = email + clientId;
      const hash = CryptoJS.HmacSHA256(message, clientSecret);
      const secretHash = CryptoJS.enc.Base64.stringify(hash);
      options.clientMetadata.SECRET_HASH = secretHash;
    }

    console.debug('[AuthService] AmplifyConfirmResetPassword payload', {
      username: email,
      options: {
        ...options,
        ...(options.secretHash ? { secretHash: '***' } : {}) // Mask secretHash in logs
      }
    });

    await amplifyConfirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword,
      options
    });
    console.debug('[AuthService] ResetPassword success');
  } catch (error) {
    console.error('[AuthService] ResetPassword error:', error);
    throw mapCognitoError(error);
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await amplifySignOut();
  } catch (error) {
    throw mapCognitoError(error);
  }
};

export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    console.debug('[AuthService] Refreshing tokens');
    const session = await fetchAuthSession({ forceRefresh: true });
    
    if (!session.tokens) {
      console.error('[AuthService] Token refresh failed: No active session found');
      throw new Error('No active session found');
    }
    
    const accessToken = session.tokens.accessToken?.toString() || '';
    const idToken = session.tokens.idToken?.toString() || '';
    const expiresAt = session.tokens.accessToken?.payload.exp || 0;
    
    console.debug('[AuthService] Token refresh successful', {
      accessToken: accessToken.slice(0, 10) + '...',
      idToken: idToken.slice(0, 10) + '...',
      expiresAt
    });
    
    return {
      accessToken,
      idToken,
      expiresIn: expiresAt
    };
  } catch (error) {
    console.error('[AuthService] Token refresh error:', error);
    throw mapCognitoError(error);
  }
};

export const decodeToken = (token: string) => {
  try {
    console.debug('[AuthService] Decoding token');
    const decoded = JSON.parse(atob(token.split('.')[1]));
    
    console.debug('[AuthService] Decoded token payload', {
      sub: decoded.sub,
      email: decoded.email,
      email_verified: decoded.email_verified,
      exp: decoded.exp
    });
    
    return {
      sub: decoded.sub,
      email: decoded.email,
      email_verified: decoded.email_verified
    };
  } catch (error) {
    console.error('[AuthService] Token decode error:', error, token);
    throw new Error('Invalid token format');
  }
};

export { mapCognitoError };