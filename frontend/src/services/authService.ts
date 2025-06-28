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
  if (!error.name) return error;
  
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

  return new Error(errorMap[error.name] || 'Authentication failed');
};

interface AuthResponse {
  accessToken: string;
  idToken: string;
  expiresIn: number;
}

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { isSignedIn, nextStep } = await amplifySignIn({ username: email, password });
    if (!isSignedIn) {
      throw new Error(`Sign-in requires further steps: ${nextStep?.signInStep}`);
    }
    
    const session = await fetchAuthSession();
    return {
      accessToken: session.tokens?.accessToken?.toString() || '',
      idToken: session.tokens?.idToken?.toString() || '',
      expiresIn: session.tokens?.accessToken?.payload.exp || 0
    };
  } catch (error) {
    throw mapCognitoError(error);
  }
};

export const signUp = async (email: string, password: string): Promise<string> => {
  try {
    const result = await amplifySignUp({
      username: email,
      password,
      options: {
        userAttributes: { email }
      }
    });
    return result.userId || '';
  } catch (error) {
    throw mapCognitoError(error);
  }
};

export const confirmSignUp = async (email: string, code: string): Promise<void> => {
  try {
    await amplifyConfirmSignUp({ username: email, confirmationCode: code });
  } catch (error) {
    throw mapCognitoError(error);
  }
};

export const resendSignUpCode = async (email: string) => {
  try {
    await amplifyResendSignUpCode({ username: email });
  } catch (error) {
    throw mapCognitoError(error);
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await amplifyResetPassword({ username: email });
  } catch (error) {
    throw mapCognitoError(error);
  }
};

export const resetPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
  try {
    await amplifyConfirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword
    });
  } catch (error) {
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
    // Force token refresh by fetching a new session
    const session = await fetchAuthSession({ forceRefresh: true });
    
    if (!session.tokens) {
      throw new Error('No active session found');
    }
    return {
      accessToken: session.tokens.accessToken?.toString() || '',
      idToken: session.tokens.idToken?.toString() || '',
      expiresIn: (session.tokens.accessToken?.payload.exp || 0) - Math.floor(Date.now() / 1000)
    };
  } catch (error) {
    throw mapCognitoError(error);
  }
};

export const decodeToken = (token: string) => {
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return {
      sub: decoded.sub,
      email: decoded.email,
      email_verified: decoded.email_verified
    };
  } catch (error) {
    throw new Error('Invalid token format');
  }
};

export { mapCognitoError };