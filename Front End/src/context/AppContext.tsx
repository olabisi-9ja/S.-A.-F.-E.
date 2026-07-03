import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Incident, Alert, Message, IncidentStatus } from '../types';
import { incidentsAPI, alertsAPI, messagesAPI } from '../services/api';
import { MOCK_INCIDENTS, MOCK_ALERTS, MOCK_MESSAGES } from '../data/mockData';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Fix base url for socket by stripping /api if it exists
const SOCKET_URL = API_BASE_URL.replace(/\/api$/, '');

let socketInstance: Socket | null = null;
const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
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
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useMock, setUseMock] = useState(true);

  useEffect(() => {
    refreshData();
    
    const socket = getSocket();
    
    // Listen for new messages globally
    socket.on('new_message', (msg: Message) => {
      setMessages(prev => {
        // Prevent duplicates
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.off('new_message');
    };
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [incidentsResult, alertsResult] = await Promise.all([
        incidentsAPI.getAll({ limit: 100 }),
        alertsAPI.getAll({ limit: 50 }),
      ]);

      if (incidentsResult.success && incidentsResult.data) {
        setIncidents(incidentsResult.data.incidents);
        setUseMock(false);
      }
      if (alertsResult.success && alertsResult.data) {
        setAlerts(alertsResult.data.alerts);
        setUseMock(false);
      }
    } catch (error) {
      console.error('API fetch failed. Ensure VITE_API_URL is set in production:', error);
      // We no longer fall back to dummy data in production
      setUseMock(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addIncident = useCallback(async (data: Omit<Incident, 'id' | 'created_at' | 'status' | 'ai_severity_score' | 'ai_category_suggestion'>) => {
    if (useMock) {
      await new Promise(r => setTimeout(r, 1200));
      const severityMap: Record<string, number> = {
        'Assault': 88, 'Armed Robbery': 95, 'Cultism': 90,
        'Theft': 70, 'Harassment': 65, 'Suspicious Activity': 55,
        'Vandalism': 45, 'Fire': 92, 'Emergency / Medical': 93, 'Other': 40,
      };
      const newInc: Incident = {
        ...data,
        id: Date.now(),
        status: 'received',
        ai_severity_score: severityMap[data.category] ?? 50,
        ai_category_suggestion: data.category,
        created_at: new Date().toISOString(),
      } as Incident;
      setIncidents(prev => [newInc, ...prev]);
      return newInc;
    }

    const result = await incidentsAPI.create(data);
    if (result.success && result.data) {
      const newInc = result.data.incident;
      setIncidents(prev => [newInc, ...prev]);
      return newInc;
    }
    return null;
  }, [useMock]);

  const updateIncidentStatus = useCallback(async (id: number, status: IncidentStatus, officer?: string) => {
    if (useMock) {
      setIncidents(prev => prev.map(inc =>
        inc.id === id ? { ...inc, status, ...(officer ? { assigned_officer: officer } : {}) } : inc
      ));
      return true;
    }

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
  }, [useMock]);

  const triggerAlert = useCallback(async (lat: number, lng: number, mode: 'https' | 'mesh') => {
    if (useMock) {
      await new Promise(r => setTimeout(r, 800));
      const newAlert: Alert = {
        id: Date.now(),
        user_id: 99,
        user_name: 'Current User',
        latitude: lat,
        longitude: lng,
        transmission_mode: mode,
        acknowledged: false,
        resolved: false,
        created_at: new Date().toISOString(),
      } as Alert;
      setAlerts(prev => [newAlert, ...prev]);
      return true;
    }

    const result = await alertsAPI.trigger(lat, lng, mode);
    if (result.success && result.data) {
      setAlerts(prev => [result.data!.alert, ...prev]);
      return true;
    }
    return false;
  }, [useMock]);

  const acknowledgeAlert = useCallback(async (id: number) => {
    if (useMock) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
      return true;
    }

    const result = await alertsAPI.acknowledge(id);
    if (result.success) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
      return true;
    }
    return false;
  }, [useMock]);

  const resolveAlert = useCallback(async (id: number) => {
    if (useMock) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true, acknowledged: true } : a));
      return true;
    }

    const result = await alertsAPI.resolve(id);
    if (result.success) {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true, acknowledged: true } : a));
      return true;
    }
    return false;
  }, [useMock]);

  const sendMessage = useCallback(async (incident_id: number, sender_id: number, sender_name: string, sender_role: string, content: string) => {
    if (useMock) {
      await new Promise(r => setTimeout(r, 500));
      const msg: Message = {
        id: Date.now(),
        incident_id,
        sender_id,
        sender_name,
        sender_role: sender_role as Message['sender_role'],
        content,
        created_at: new Date().toISOString(),
      } as Message;
      setMessages(prev => [...prev, msg]);
      return msg;
    }

    const result = await messagesAPI.send(incident_id, content);
    if (result.success && result.data) {
      setMessages(prev => [...prev, result.data!.message]);
      return result.data.message;
    }
    return null;
  }, [useMock]);

  const getIncidentMessages = useCallback((incident_id: number) => {
    return messages.filter(m => m.incident_id === incident_id);
  }, [messages]);

  const fetchIncidentMessages = useCallback(async (incident_id: number) => {
    if (useMock) return;
    const result = await messagesAPI.getByIncident(incident_id);
    if (result.success && result.data) {
      setMessages(prev => {
        // Merge without duplicates
        const existingIds = new Set(prev.map(m => m.id));
        const newMsgs = result.data!.messages.filter(m => !existingIds.has(m.id));
        return [...prev, ...newMsgs];
      });
    }
  }, [useMock]);

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
