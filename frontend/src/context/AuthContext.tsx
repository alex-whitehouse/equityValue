import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as authService from '../services/authService';

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
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Check auth status using Amplify when session is not in localStorage
  useEffect(() => {
    if (isAuthenticated) return;

    const checkAuth = async () => {
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
      } finally {
        setIsLoading(false);
      }
    };

    if (!localStorage.getItem('idToken')) {
      checkAuth();
    }
  }, [isAuthenticated]);

  const refreshTimer = useRef<number | null>(null);

  // Clear refresh timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimer.current) {
        clearTimeout(refreshTimer.current);
      }
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { idToken, accessToken, expiresIn } = await authService.signIn(email, password);
      
      const decoded = jwtDecode<{ email: string; sub: string; exp: number }>(idToken);
      localStorage.setItem('idToken', idToken);
      localStorage.setItem('accessToken', accessToken);
      
      setUser({ username: decoded.email, email: decoded.email });
      setIsAuthenticated(true);
      setAuthModalType(null);
      
      // Schedule token refresh 1 minute before expiration
      const expiresAt = decoded.exp * 1000;
      scheduleTokenRefresh(expiresAt - Date.now() - 60000);
    } catch (error) {
      console.error('Error signing in:', error);
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
    try {
      const accessToken = localStorage.getItem('accessToken') || '';
      await authService.signOut();
      
      localStorage.removeItem('idToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
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
  
  const scheduleTokenRefresh = (delay: number) => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
    }
    
    refreshTimer.current = setTimeout(() => {
      refreshToken();
    }, delay);
  };
  
  const refreshToken = async () => {
    try {
      // Call authService to refresh tokens using HTTP-only cookie
      const { idToken, accessToken, expiresIn } = await authService.refreshToken();

      // Update tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('idToken', idToken);

      // Schedule next refresh 1 minute before expiration
      const expiresAt = Date.now() + expiresIn * 1000;
      scheduleTokenRefresh(expiresAt - Date.now() - 60000);
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleSignOut();
    }
  };

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