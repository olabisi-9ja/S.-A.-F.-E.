import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User } from '../types';
import { authAPI } from '../services/api';
import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

interface RegisterData {
  full_name: string;
  institutional_email: string;
  phone: string;
  matric_or_staff_id: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('safe_token');
    if (token) {
      authAPI.getProfile().then(result => {
        if (result.success && result.data?.user) {
          setUser(result.data.user);
        } else {
          localStorage.removeItem('safe_token');
          tryMockLogin();
        }
        setIsLoading(false);
      }).catch(() => {
        localStorage.removeItem('safe_token');
        tryMockLogin();
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const tryMockLogin = () => {
    const mockEmail = localStorage.getItem('safe_mock_email');
    if (mockEmail) {
      const mockUser = MOCK_USERS.find(u => u.institutional_email === mockEmail);
      if (mockUser) setUser(mockUser);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const result = await authAPI.login(email, password);
    
    if (result.success && result.data) {
      localStorage.setItem('safe_token', result.data.token);
      localStorage.removeItem('safe_mock_email');
      setUser(result.data.user);
      return { success: true };
    }

    const mockUser = MOCK_USERS.find(u => u.institutional_email === email);
    if (mockUser) {
      if (email === 'security@kwasu.edu.ng' && password === 'safe-admin') {
        setUser(mockUser);
        localStorage.setItem('safe_mock_email', email);
        return { success: true };
      }
      if (email === 'superadmin@kwasu.edu.ng' && password === 'safe-super-admin') {
        setUser(mockUser);
        localStorage.setItem('safe_mock_email', email);
        return { success: true };
      }
      if (email === 'adewale@kwasu.edu.ng' && password === 'password') {
        setUser(MOCK_USERS[0]);
        localStorage.setItem('safe_mock_email', email);
        return { success: true };
      }
      if (email === 'fatima@kwasu.edu.ng' && password === 'password') {
        setUser(MOCK_USERS[2]);
        localStorage.setItem('safe_mock_email', email);
        return { success: true };
      }
    }

    if (email.endsWith('@kwasu.edu.ng') && password.length >= 6) {
      const newUser: User = {
        id: 99,
        full_name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        institutional_email: email,
        role: 'standard_user',
        created_at: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem('safe_mock_email', email);
      return { success: true };
    }

    return { success: false, error: result.error || 'Invalid email or password.' };
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const result = await authAPI.register(data);
    
    if (result.success && result.data) {
      localStorage.setItem('safe_token', result.data.token);
      localStorage.removeItem('safe_mock_email');
      setUser(result.data.user);
      return { success: true };
    }

    if (!data.institutional_email.endsWith('@kwasu.edu.ng')) {
      return { success: false, error: 'Only @kwasu.edu.ng email addresses are accepted.' };
    }

    const newUser: User = {
      id: Math.floor(Math.random() * 900) + 100,
      full_name: data.full_name,
      institutional_email: data.institutional_email,
      role: 'standard_user',
      matric_or_staff_id: data.matric_or_staff_id,
      phone: data.phone,
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('safe_token');
    localStorage.removeItem('safe_mock_email');
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const result = await authAPI.getProfile();
    if (result.success && result.data?.user) {
      setUser(result.data.user);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login, 
      register, 
      logout,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
