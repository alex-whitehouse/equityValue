import { api } from './api';

// Map backend authentication errors to user-friendly messages
const mapAuthError = (error: any): Error => {
  // Handle Axios error structure
  const errorData = error.response?.data?.error || error.message;
  
  if (typeof errorData === 'string') {
    return new Error(errorData);
  }
  
  console.warn('[AuthService] Unknown error format:', error);
  return new Error('Authentication failed');
};

interface AuthResponse {
  accessToken: string;
  idToken: string;
  expiresIn: number;
}

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.debug(`[AuthService] SignIn initiated for: ${email}`);
    
    const response = await api.post('/auth', {
      action: 'signIn',
      email,
      password
    });
    
    console.debug('[AuthService] SignIn response', {
      accessToken: response.data.accessToken.slice(0, 10) + '...',
      idToken: response.data.idToken.slice(0, 10) + '...',
      expiresIn: response.data.expiresIn
    });
    
    return response.data;
  } catch (error) {
    console.error('[AuthService] SignIn error:', error);
    throw mapAuthError(error);
  }
};

export const signUp = async (email: string, password: string): Promise<string> => {
  try {
    console.debug('[AuthService] SignUp initiated', { email });
    
    await api.post('/auth', {
      action: 'signUp',
      email,
      password
    });
    
    console.debug('[AuthService] SignUp success');
    return '';
  } catch (error) {
    console.error('[AuthService] SignUp error:', error);
    throw mapAuthError(error);
  }
};

export const confirmSignUp = async (email: string, code: string): Promise<void> => {
  try {
    console.debug('[AuthService] ConfirmSignUp initiated', { email });
    
    await api.post('/auth', {
      action: 'confirmSignUp',
      email,
      code
    });
    
    console.debug('[AuthService] ConfirmSignUp success');
  } catch (error) {
    console.error('[AuthService] ConfirmSignUp error:', error);
    throw mapAuthError(error);
  }
};

export const resendSignUpCode = async (email: string): Promise<void> => {
  try {
    console.debug('[AuthService] ResendSignUpCode initiated', { email });
    
    await api.post('/auth', {
      action: 'resendCode',
      email
    });
    
    console.debug('[AuthService] ResendSignUpCode success');
  } catch (error) {
    console.error('[AuthService] ResendSignUpCode error:', error);
    throw mapAuthError(error);
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    console.debug('[AuthService] ForgotPassword initiated', { email });
    
    await api.post('/auth', {
      action: 'forgotPassword',
      email
    });
    
    console.debug('[AuthService] ForgotPassword success');
  } catch (error) {
    console.error('[AuthService] ForgotPassword error:', error);
    throw mapAuthError(error);
  }
};

export const resetPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
  try {
    console.debug('[AuthService] ResetPassword initiated', { email });
    
    await api.post('/auth', {
      action: 'confirmPassword',
      email,
      code,
      newPassword
    });
    
    console.debug('[AuthService] ResetPassword success');
  } catch (error) {
    console.error('[AuthService] ResetPassword error:', error);
    throw mapAuthError(error);
  }
};

export const signOut = async (): Promise<void> => {
  try {
    // Clear tokens from storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
  } catch (error) {
    throw mapAuthError(error);
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