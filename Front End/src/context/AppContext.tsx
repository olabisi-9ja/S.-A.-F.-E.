import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Incident, Alert, Message, IncidentStatus } from '../types';
import { MOCK_INCIDENTS, MOCK_ALERTS, MOCK_MESSAGES } from '../data/mockData';

interface AppContextType {
  incidents: Incident[];
  alerts: Alert[];
  messages: Message[];
  addIncident: (inc: Omit<Incident, 'id' | 'created_at' | 'status' | 'ai_severity_score' | 'ai_category_suggestion'>) => Promise<Incident>;
  updateIncidentStatus: (id: number, status: IncidentStatus, officer?: string) => void;
  triggerAlert: (lat: number, lng: number, mode: 'https' | 'mesh') => void;
  acknowledgeAlert: (id: number) => void;
  resolveAlert: (id: number) => void;
  sendMessage: (incident_id: number, sender_id: number, sender_name: string, sender_role: string, content: string) => void;
  getIncidentMessages: (incident_id: number) => Message[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);

  const addIncident = useCallback(async (data: Omit<Incident, 'id' | 'created_at' | 'status' | 'ai_severity_score' | 'ai_category_suggestion'>) => {
    await new Promise(r => setTimeout(r, 1200));

    // Simulate AI classification
    const severityMap: Record<string, number> = {
      'Assault': 88, 'Armed Robbery': 95, 'Cultism': 90,
      'Theft': 70, 'Harassment': 65, 'Suspicious Activity': 55,
      'Vandalism': 45, 'Fire': 92, 'Emergency / Medical': 93, 'Other': 40,
    };

    const ai_severity_score = severityMap[data.category] ?? 50;
    const newInc: Incident = {
      ...data,
      id: incidents.length + 100,
      status: 'received',
      ai_severity_score,
      ai_category_suggestion: data.category,
      created_at: new Date().toISOString(),
    };
    setIncidents(prev => [newInc, ...prev]);
    return newInc;
  }, [incidents.length]);

  const updateIncidentStatus = useCallback((id: number, status: IncidentStatus, officer?: string) => {
    setIncidents(prev => prev.map(inc =>
      inc.id === id ? { ...inc, status, ...(officer ? { assigned_officer: officer } : {}) } : inc
    ));
  }, []);

  const triggerAlert = useCallback((lat: number, lng: number, mode: 'https' | 'mesh') => {
    const newAlert: Alert = {
      id: alerts.length + 100,
      user_id: 99,
      user_name: 'Current User',
      latitude: lat,
      longitude: lng,
      transmission_mode: mode,
      acknowledged: false,
      resolved: false,
      created_at: new Date().toISOString(),
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, [alerts.length]);

  const acknowledgeAlert = useCallback((id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  }, []);

  const resolveAlert = useCallback((id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true, acknowledged: true } : a));
  }, []);

  const sendMessage = useCallback((incident_id: number, sender_id: number, sender_name: string, sender_role: string, content: string) => {
    const msg: Message = {
      id: messages.length + 100,
      incident_id,
      sender_id,
      sender_name,
      sender_role: sender_role as Message['sender_role'],
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
  }, [messages.length]);

  const getIncidentMessages = useCallback((incident_id: number) => {
    return messages.filter(m => m.incident_id === incident_id);
  }, [messages]);

  return (
    <AppContext.Provider value={{
      incidents, alerts, messages,
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
