export type UserRole = 'standard_user' | 'security_admin' | 'super_admin';

export interface User {
  id: number;
  full_name: string;
  institutional_email: string;
  role: UserRole;
  matric_or_staff_id?: string;
  phone?: string;
  created_at: string;
}

export type IncidentStatus = 'received' | 'in_progress' | 'resolved';
export type TransmissionMode = 'https' | 'mesh';

export interface Incident {
  id: number;
  reporter_id: number;
  reporter_name: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  status: IncidentStatus;
  ai_severity_score: number;
  ai_category_suggestion: string;
  assigned_officer?: string;
  media_url?: string;
  created_at: string;
}

export interface Alert {
  id: number;
  user_id: number;
  user_name: string;
  latitude: number;
  longitude: number;
  transmission_mode: TransmissionMode;
  acknowledged: boolean;
  resolved: boolean;
  created_at: string;
}

export interface Message {
  id: number;
  incident_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: UserRole;
  content: string;
  created_at: string;
}

export interface HotspotCluster {
  lat: number;
  lng: number;
  count: number;
  cluster: number;
}

export interface AnalyticsSummary {
  total_incidents: number;
  active_alerts: number;
  resolved_today: number;
  avg_response_time_s: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
