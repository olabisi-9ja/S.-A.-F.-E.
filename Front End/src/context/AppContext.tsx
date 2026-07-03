import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Incident, Alert, Message, IncidentStatus } from '../types';
import { incidentsAPI, alertsAPI, messagesAPI } from '../services/api';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Fix base url for socket by stripping /api if it exists
const SOCKET_URL = API_BASE_URL.replace(/\/api$/, '');

let socketInstance: Socket | null = null;
const getSocket = () => {
  if (!socketInstance) {
    const token = localStorage.getItem('safe_token');
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: { token }
    });
  }
  return socketInstance;
};

interface AppContextType {
  incidents: Incident[];
  alerts: Alert[];
  messages: Message[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addIncident: (inc: Omit<Incident, 'id' | 'created_at' | 'status' | 'ai_severity_score' | 'ai_category_suggestion'>) => Promise<Incident | null>;
  updateIncidentStatus: (id: number, status: IncidentStatus, officer?: string) => Promise<boolean>;
  triggerAlert: (lat: number, lng: number, mode: 'https' | 'mesh') => Promise<boolean>;
  acknowledgeAlert: (id: number) => Promise<boolean>;
  resolveAlert: (id: number) => Promise<boolean>;
  sendMessage: (incident_id: number, sender_id: number, sender_name: string, sender_role: string, content: string) => Promise<Message | null>;
  getIncidentMessages: (incident_id: number) => Message[];
  fetchIncidentMessages: (incident_id: number) => Promise<void>;
  joinIncidentChat: (incident_id: number) => void;
  leaveIncidentChat: (incident_id: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [incidentsResult, alertsResult] = await Promise.all([
        incidentsAPI.getAll({ limit: 100 }),
        alertsAPI.getAll({ limit: 50 }),
      ]);

      if (incidentsResult.success && incidentsResult.data) {
        setIncidents(incidentsResult.data.incidents);
      }
      if (alertsResult.success && alertsResult.data) {
        setAlerts(alertsResult.data.alerts);
      }
    } catch (error) {
      console.error('API fetch failed. Ensure VITE_API_URL is set in production:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on authentication state change
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
      if (user?.role === 'admin' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [isAuthenticated, user, refreshData]);

  // Initial setup for sockets and offline sync
  useEffect(() => {
    refreshData();
    
    const socket = getSocket();
    
    // Listen for new messages globally
    socket.on('new_message', (msg: Message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('new_incident', (inc: Incident) => {
      setIncidents(prev => [inc, ...prev.filter(i => i.id !== inc.id)]);
      if (user?.role === 'admin' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('New S.A.F.E. Incident', {
          body: `${inc.category} reported. AI Severity: ${inc.ai_severity_score}`
        });
      }
    });

    socket.on('new_alert', (alert: Alert) => {
      setAlerts(prev => [alert, ...prev.filter(a => a.id !== alert.id)]);
      if (user?.role === 'admin' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 S.A.F.E. SOS ALERT!', {
          body: `Emergency triggered by ${alert.user_name}`
        });
      }
    });

    // Offline sync handler for alerts
    const handleOnline = async () => {
      const pendingStr = localStorage.getItem('safe_pending_alerts');
      if (pendingStr) {
        try {
          const pending = JSON.parse(pendingStr);
          for (const alert of pending) {
            await alertsAPI.trigger(alert.lat, alert.lng, 'mesh');
          }
          localStorage.removeItem('safe_pending_alerts');
          refreshData();
        } catch (e) {
          console.error('Failed to sync pending alerts:', e);
        }
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      socket.off('new_message');
      socket.off('new_incident');
      socket.off('new_alert');
      window.removeEventListener('online', handleOnline);
    };
  }, [refreshData, user]);

  const addIncident = useCallback(async (data: Omit<Incident, 'id' | 'created_at' | 'status' | 'ai_severity_score' | 'ai_category_suggestion'>) => {
    const result = await incidentsAPI.create(data);
    if (result.success && result.data) {
      const newInc = result.data.incident;
      setIncidents(prev => [newInc, ...prev]);
      return newInc;
    }
    return null;
  }, []);

  const updateIncidentStatus = useCallback(async (id: number, status: IncidentStatus, officer?: string) => {
    const result = await incidentsAPI.update(id, { 
      status, 
      ...(officer && { assigned_officer_name: officer }) 
    });
    if (result.success && result.data) {
      setIncidents(prev => prev.map(inc =>
        inc.id === id ? result.data!.incident : inc
      ));
      return true;
    }
    return false;
  }, []);

  const triggerAlert = useCallback(async (lat: number, lng: number, mode: 'https' | 'mesh') => {
    if (!navigator.onLine) {
      // Store locally for Mesh offline fallback
      const pendingStr = localStorage.getItem('safe_pending_alerts');
      const pending = pendingStr ? JSON.parse(pendingStr) : [];
      pending.push({ lat, lng, timestamp: new Date().toISOString() });
      localStorage.setItem('safe_pending_alerts', JSON.stringify(pending));
      return true; // Consider it locally "sent" for mesh processing later
    }

    const result = await alertsAPI.trigger(lat, lng, mode);
    if (result.success && result.data) {
      setAlerts(prev => [result.data!.alert, ...prev]);
      return true;
    }
    return false;
  }, []);

  const acknowledgeAlert = useCallback(async (id: number) => {
    const result = await alertsAPI.acknowledge(id);
    if (result.success) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
      return true;
    }
    return false;
  }, []);

  const resolveAlert = useCallback(async (id: number) => {
    const result = await alertsAPI.resolve(id);
    if (result.success) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true, acknowledged: true } : a));
      return true;
    }
    return false;
  }, []);

  const sendMessage = useCallback(async (incident_id: number, sender_id: number, sender_name: string, sender_role: string, content: string) => {
    const result = await messagesAPI.send(incident_id, content);
    if (result.success && result.data) {
      setMessages(prev => [...prev, result.data!.message]);
      return result.data.message;
    }
    return null;
  }, []);

  const getIncidentMessages = useCallback((incident_id: number) => {
    return messages.filter(m => m.incident_id === incident_id);
  }, [messages]);

  const fetchIncidentMessages = useCallback(async (incident_id: number) => {
    const result = await messagesAPI.getByIncident(incident_id);
    if (result.success && result.data) {
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMsgs = result.data!.messages.filter(m => !existingIds.has(m.id));
        return [...prev, ...newMsgs];
      });
    }
  }, []);

  const joinIncidentChat = useCallback((incident_id: number) => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('join_incident', incident_id);
    }
  }, []);

  const leaveIncidentChat = useCallback((incident_id: number) => {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('leave_incident', incident_id);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      incidents, alerts, messages,
      isLoading,
      refreshData,
      addIncident, updateIncidentStatus,
      triggerAlert, acknowledgeAlert, resolveAlert,
      sendMessage, getIncidentMessages, fetchIncidentMessages,
      joinIncidentChat, leaveIncidentChat,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
