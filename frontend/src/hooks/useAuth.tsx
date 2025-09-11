import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient } from '../api/client';
import { User, AuthType } from '../types';

interface AuthContextType {
  user: User | null;
  login: (provider: AuthType, params?: Record<string, string>) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Проверяем наличие cookie и извлекаем данные пользователя из JWT
    const checkAuth = async () => {
      try {
        const response = await apiClient.getProfile();
        setUser(response.user);
      } catch (err) {
        // Если запрос не удался, пользователь не аутентифицирован
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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
      if (!response.user) {
        throw new Error('Invalid authentication response');
      }
      
      // JWT токен теперь хранится в HTTP-only cookie
      setUser(response.user);
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
      if (!response.user) {
        throw new Error('Invalid registration response');
      }
      
      // JWT токен теперь хранится в HTTP-only cookie
      setUser(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Отправляем запрос на logout для очистки cookie на сервере
      await apiClient.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    // Больше не нужно сохранять в localStorage - данные в JWT
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

  return { user, login, register, logout, updateUser, loading, error };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthState();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};