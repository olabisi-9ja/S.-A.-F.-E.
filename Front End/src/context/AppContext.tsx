import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Incident, Alert, Message, IncidentStatus } from '../types';
import { incidentsAPI, alertsAPI, messagesAPI } from '../services/api';
import { MOCK_INCIDENTS, MOCK_ALERTS, MOCK_MESSAGES } from '../data/mockData';

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
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [useMock, setUseMock] = useState(true);

  useEffect(() => {
    refreshData();
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
      console.warn('API fetch failed, using mock data:', error);
      setUseMock(true);
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

  return (
    <AppContext.Provider value={{
      incidents, alerts, messages,
      isLoading,
      refreshData,
      addIncident, updateIncidentStatus,
      triggerAlert, acknowledgeAlert, resolveAlert,
      sendMessage, getIncidentMessages,
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
