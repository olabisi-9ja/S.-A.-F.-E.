import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import { startMeshAutoSync, syncQueuedPackets } from '../services/mesh';
import { registerForPushNotifications } from '../services/notifications';

interface User {
  id: number;
  full_name: string;
  institutional_email: string;
  role: string;
  phone?: string;
  matric_or_staff_id?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Bring up the real-time layer once we know we have a valid session:
  // live socket connection, mesh auto-sync-on-reconnect, and any offline
  // SOS alerts that queued up while this device was signed out but still
  // held onto a pending packet.
  const activateSession = async () => {
    startMeshAutoSync();
    syncQueuedPackets().catch(() => {});
    connectSocket().catch(() => {});
    registerForPushNotifications().catch(() => {});
  };

  useEffect(() => {
    // Load token from storage on startup
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('safe_token');
        if (storedToken) {
          setToken(storedToken);
          // Try to fetch profile if we have token
          const result = await api.get('/api/auth/profile');
          if (result && result.success && result.data && result.data.user) {
            setUser(result.data.user);
            activateSession();
          } else {
             // Invalid token fallback
             await AsyncStorage.removeItem('safe_token');
             setToken(null);
          }
        }
      } catch (e) {
        console.error('Failed to load token or profile', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (newToken: string) => {
    try {
      await AsyncStorage.setItem('safe_token', newToken);
      setToken(newToken);
      const result = await api.get('/api/auth/profile');
      if (result && result.success && result.data && result.data.user) {
        setUser(result.data.user);
        activateSession();
      }
    } catch (e) {
      console.error('Failed to save token or fetch profile', e);
    }
  };

  const logout = async () => {
    try {
      disconnectSocket();
      await AsyncStorage.removeItem('safe_token');
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Failed to remove token', e);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
