import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { signIn, signUp, signOut, fetchAuthSession, resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { jwtDecode } from 'jwt-decode';

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
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (!token) throw new Error('No token found');
        
        const decoded = jwtDecode<{ email: string; sub: string; exp: number }>(token);
        localStorage.setItem('idToken', token);
        
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

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn({ username: email, password });
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) throw new Error('No token found after sign in');
      
      const decoded = jwtDecode<{ email: string; sub: string; exp: number }>(token);
      localStorage.setItem('idToken', token);
      
      setUser({ username: decoded.email, email: decoded.email });
      setIsAuthenticated(true);
      setAuthModalType(null);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: { email }
        }
      });
      setAuthModalType(null);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('idToken');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await resetPassword({ username: email });
      setAuthModalType(null);
    } catch (error) {
      console.error('Error initiating password reset:', error);
      throw error;
    }
  };

  const handleResetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
      setAuthModalType(null);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
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