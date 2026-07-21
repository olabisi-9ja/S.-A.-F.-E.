import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (idToken: string) => Promise<{ success: boolean; error?: string }>;
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
    const cachedUser = localStorage.getItem('safe_user');
    
    if (token) {
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      authAPI.getProfile().then(result => {
        if (result.success && result.data?.user) {
          setUser(result.data.user);
          localStorage.setItem('safe_user', JSON.stringify(result.data.user));
        } else if (result.success === false) {
          const isAuthError = 
            result.error?.toLowerCase().includes('token') || 
            result.error?.toLowerCase().includes('denied') || 
            result.error?.toLowerCase().includes('expired') || 
            result.error?.toLowerCase().includes('credentials') ||
            result.error?.toLowerCase().includes('invalid');
            
          if (isAuthError) {
            localStorage.removeItem('safe_token');
            localStorage.removeItem('safe_refresh_token');
            localStorage.removeItem('safe_user');
            setUser(null);
          }
        }
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false); // Ignore network error, keep local session
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authAPI.login(email, password);
    
    if (result.success && result.data) {
      localStorage.setItem('safe_token', result.data.token);
      if (result.data.refreshToken) {
        localStorage.setItem('safe_refresh_token', result.data.refreshToken);
      }
      localStorage.setItem('safe_user', JSON.stringify(result.data.user));
      setUser(result.data.user);
      return { success: true };
    }

    return { success: false, error: result.error || 'Invalid email or password.' };
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const result = await authAPI.googleLogin(idToken);
    
    if (result.success && result.data) {
      localStorage.setItem('safe_token', result.data.token);
      if (result.data.refreshToken) {
        localStorage.setItem('safe_refresh_token', result.data.refreshToken);
      }
      localStorage.setItem('safe_user', JSON.stringify(result.data.user));
      setUser(result.data.user);
      return { success: true };
    }

    return { success: false, error: result.error || 'Google login failed.' };
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const result = await authAPI.register(data);
    
    if (result.success) {
      // Don't auto-login on register because they need to verify email
      return { success: true };
    }

    return { success: false, error: result.error || 'Registration failed.' };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('safe_token');
      localStorage.removeItem('safe_refresh_token');
      localStorage.removeItem('safe_user');
      setUser(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const result = await authAPI.getProfile();
    if (result.success && result.data?.user) {
      setUser(result.data.user);
      localStorage.setItem('safe_user', JSON.stringify(result.data.user));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login, 
      loginWithGoogle,
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
