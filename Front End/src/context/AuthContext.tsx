import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User } from '../types';
import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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

  const login = useCallback(async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 800));

    // Admin credentials
    if (email === 'security@kwasu.edu.ng' && password === 'safe-admin') {
      setUser(MOCK_USERS[1]);
      return { success: true };
    }

    // Student credentials
    if (email === 'adewale@kwasu.edu.ng' && password === 'password') {
      setUser(MOCK_USERS[0]);
      return { success: true };
    }

    if (email === 'fatima@kwasu.edu.ng' && password === 'password') {
      setUser(MOCK_USERS[2]);
      return { success: true };
    }

    // Check if it's a @kwasu.edu.ng email with any password for demo
    if (email.endsWith('@kwasu.edu.ng') && password.length >= 6) {
      const newUser: User = {
        id: 99,
        full_name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        institutional_email: email,
        role: 'standard_user',
        created_at: new Date().toISOString(),
      };
      setUser(newUser);
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password.' };
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    await new Promise(r => setTimeout(r, 1000));

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
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
