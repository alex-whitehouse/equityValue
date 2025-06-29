import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as authService from '../services/authService';

// Debug logger
const debug = (message: string, data?: any) => {
  console.debug(`[AuthContext] ${message}`, data);
};

interface User {
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  resendSignUpCode: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  restoreSession: () => Promise<void>;
  openAuthModal: (type: 'signIn' | 'signUp' | 'forgotPassword') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalType, setAuthModalType] = useState<'signIn' | 'signUp' | 'forgotPassword' | null>(null);

  // Restore session from localStorage on initial load
  useEffect(() => {
    const restoreSession = async () => {
      debug('Attempting to restore session from localStorage');
      try {
        const token = localStorage.getItem('idToken');
        if (!token) {
          debug('No token found in storage');
          setIsLoading(false);
          return;
        }
        
        debug('Found token in storage');
        const decoded = jwtDecode<{ email: string; sub: string; exp: number }>(token);
        debug('Decoded token', {
          email: decoded.email,
          exp: new Date(decoded.exp * 1000).toISOString(),
          currentTime: new Date().toISOString()
        });
        
        // Check token expiration
        if (decoded.exp * 1000 < Date.now()) {
          debug('Token expired, clearing session');
          localStorage.removeItem('idToken');
          localStorage.removeItem('accessToken');
          setUser(null);
          setIsAuthenticated(false);
        } else {
          debug('Token valid, setting user');
          setUser({ username: decoded.email, email: decoded.email });
          setIsAuthenticated(true);
        }
      } catch (error) {
        debug('Session restoration failed', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);



  const handleSignIn = async (email: string, password: string) => {
    debug('SignIn initiated', { email });
    try {
      const { idToken, accessToken, expiresIn } = await authService.signIn(email, password);
      debug('SignIn successful', {
        idToken: idToken.slice(0, 10) + '...',
        accessToken: accessToken.slice(0, 10) + '...',
        expiresIn
      });
      
      const decoded = jwtDecode<{ email: string; sub: string; exp: number }>(idToken);
      debug('Decoded token', {
        email: decoded.email,
        exp: new Date(decoded.exp * 1000).toISOString()
      });
      
      localStorage.setItem('idToken', idToken);
      localStorage.setItem('accessToken', accessToken);
      
      setUser({ username: decoded.email, email: decoded.email });
      setIsAuthenticated(true);
      setAuthModalType(null);
      
      // Token refresh scheduling removed - will be implemented later
    } catch (error) {
      debug('SignIn failed', error);
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      await authService.signUp(email, password);
      // Keep modal open to show confirmation step
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const handleConfirmSignUp = async (email: string, code: string) => {
    try {
      await authService.confirmSignUp(email, code);
      setAuthModalType(null);
    } catch (error) {
      console.error('Error confirming sign up:', error);
      throw error;
    }
  };

  const handleResendSignUpCode = async (email: string) => {
    try {
      await authService.resendSignUpCode(email);
    } catch (error) {
      console.error('Error resending code:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    debug('SignOut initiated');
    try {
      await authService.signOut();
      debug('SignOut successful');
      
      localStorage.removeItem('idToken');
      localStorage.removeItem('accessToken');
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      debug('SignOut failed', error);
      throw error;
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
      setAuthModalType(null);
    } catch (error) {
      console.error('Error initiating password reset:', error);
      throw error;
    }
  };

  const handleResetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      await authService.resetPassword(email, code, newPassword);
      setAuthModalType(null);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };
  
  
  // Token refresh will be handled in future implementation
  // Currently not supported in backend

  const restoreSession = useCallback(async () => {
    try {
      const token = localStorage.getItem('idToken');
      if (!token) throw new Error('No token found in storage');
      
      const decoded = jwtDecode<{ email: string; sub: string; exp: number }>(token);
      
      // Check token expiration
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }
      
      setUser({ username: decoded.email, email: decoded.email });
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('idToken');
    }
  }, []);

  const openAuthModal = (type: 'signIn' | 'signUp' | 'forgotPassword') => {
    setAuthModalType(type);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        confirmSignUp: handleConfirmSignUp,
        resendSignUpCode: handleResendSignUpCode,
        signOut: handleSignOut,
        forgotPassword: handleForgotPassword,
        resetPassword: handleResetPassword,
        restoreSession,
        openAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};