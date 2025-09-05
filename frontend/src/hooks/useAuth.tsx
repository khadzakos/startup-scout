import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient } from '../api/client';
import { User, AuthType } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (provider: AuthType, params?: Record<string, string>) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Загружаем токен и пользователя из localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      const tokenAge = Date.now() - new Date(JSON.parse(savedUser).created_at).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (tokenAge > maxAge) {
        // Token is expired, clear it
        console.log('Token expired, clearing authentication');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        apiClient.setToken(null);
        setUser(null);
        setToken(null);
      } else {
        apiClient.setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (provider: AuthType, params?: Record<string, string>) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (provider === 'email' && params?.email && params?.password) {
        response = await apiClient.loginEmail(params.email, params.password);
      } else {
        throw new Error('Invalid authentication parameters');
      }
      
      // Check if response has required fields
      if (!response.token || !response.user) {
        throw new Error('Invalid authentication response');
      }
      
      // Сохраняем токен и пользователя
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      apiClient.setToken(response.token);
      setUser(response.user);
      setToken(response.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.registerEmail(email, username, password);
      
      // Check if response has required fields
      if (!response.token || !response.user) {
        throw new Error('Invalid registration response');
      }
      
      // Сохраняем токен и пользователя
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      apiClient.setToken(response.token);
      setUser(response.user);
      setToken(response.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    apiClient.setToken(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Listen for authentication expiration events
  useEffect(() => {
    const handleAuthExpired = () => {
      console.log('Authentication expired, logging out user');
      logout();
      // Don't redirect automatically - let user stay on current page
    };

    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  // Periodic token validation check
  useEffect(() => {
    if (!user || !localStorage.getItem('token')) return;

    const checkTokenExpiration = () => {
      const savedUser = localStorage.getItem('user');
      if (!savedUser) return;

      try {
        const userData = JSON.parse(savedUser);
        const tokenAge = Date.now() - new Date(userData.created_at).getTime();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (tokenAge > maxAge) {
          console.log('Token expired during periodic check, logging out user');
          logout();
          // Don't redirect automatically - let user stay on current page
        }
      } catch (error) {
        console.error('Error checking token expiration:', error);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  return { user, token, login, register, logout, updateUser, loading, error };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthState();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};