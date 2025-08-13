import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient } from '../api/client';
import { User, AuthType } from '../types';

interface AuthContextType {
  user: User | null;
  login: (provider: AuthType, params?: Record<string, string>) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
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
    // Загружаем токен и пользователя из localStorage
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      apiClient.setToken(token);
      setUser(JSON.parse(savedUser));
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
      } else if (provider === 'yandex' && params?.code) {
        response = await apiClient.authYandex(params.code);
      } else {
        throw new Error('Invalid authentication parameters');
      }
      
      // Сохраняем токен и пользователя
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      apiClient.setToken(response.token);
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
      
      // Сохраняем токен и пользователя
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      apiClient.setToken(response.token);
      setUser(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    apiClient.setToken(null);
  };

  return { user, login, register, logout, loading, error };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthState();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};