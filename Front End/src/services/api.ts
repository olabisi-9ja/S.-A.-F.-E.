import type { User, Incident, Alert, Message, HotspotCluster } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('safe_token');

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Request failed' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('API request failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

export const authAPI = {
  login: async (email: string, password: string) => {
    return await apiRequest<{ user: User; token: string; refreshToken?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ institutional_email: email, password }),
    });
  },

  googleLogin: async (token: string) => {
    return await apiRequest<{ user: User; token: string; refreshToken?: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  register: async (data: {
    full_name: string;
    institutional_email: string;
    password: string;
    phone: string;
    matric_or_staff_id: string;
  }) => {
    return await apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProfile: async () => {
    return await apiRequest<{ user: User }>('/auth/profile');
  },

  updateProfile: async (data: { full_name?: string; phone?: string }) => {
    return await apiRequest<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export const incidentsAPI = {
  create: async (data: {
    category: string;
    description: string;
    latitude: number;
    longitude: number;
    media_url?: string;
  }) => {
    return await apiRequest<{ incident: Incident; ai_classification: any }>('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAll: async (params?: { status?: string; category?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return await apiRequest<{ incidents: Incident[]; total: number }>(
      `/incidents?${queryParams.toString()}`
    );
  },

  getById: async (id: number) => {
    return await apiRequest<{ incident: Incident & { messages: Message[] } }>(`/incidents/${id}`);
  },

  update: async (id: number, data: {
    status?: string;
    assigned_officer_id?: number;
    assigned_officer_name?: string;
    resolution_notes?: string;
  }) => {
    return await apiRequest<{ incident: Incident }>(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getStats: async (period?: number) => {
    return await apiRequest<any>(`/incidents/stats?period=${period || 7}`);
  },
};

export const alertsAPI = {
  trigger: async (latitude: number, longitude: number, transmission_mode: 'https' | 'mesh' = 'https') => {
    return await apiRequest<{ alert: Alert }>('/alerts', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, transmission_mode }),
    });
  },

  getAll: async (params?: { resolved?: boolean; acknowledged?: boolean; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.resolved !== undefined) queryParams.append('resolved', params.resolved.toString());
    if (params?.acknowledged !== undefined) queryParams.append('acknowledged', params.acknowledged.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return await apiRequest<{ alerts: Alert[]; total: number }>(
      `/alerts?${queryParams.toString()}`
    );
  },

  getActive: async () => {
    return await apiRequest<{ alerts: Alert[]; count: number }>('/alerts/active');
  },

  acknowledge: async (id: number) => {
    return await apiRequest(`/alerts/${id}/acknowledge`, { method: 'POST' });
  },

  resolve: async (id: number) => {
    return await apiRequest(`/alerts/${id}/resolve`, { method: 'POST' });
  },
};

export const messagesAPI = {
  send: async (incident_id: number, content: string) => {
    return await apiRequest<{ message: Message }>('/messages', {
      method: 'POST',
      body: JSON.stringify({ incident_id, content }),
    });
  },

  getByIncident: async (incident_id: number) => {
    return await apiRequest<{ messages: Message[] }>(`/messages/incident/${incident_id}`);
  },

  markRead: async (id: number) => {
    return await apiRequest(`/messages/${id}/read`, { method: 'PATCH' });
  },
};

export const meshAPI = {
  sync: async (data: {
    encrypted_payload: string;
    ttl: number;
    origin_device_id: string;
    relay_device_id?: string;
    hop_count?: number;
  }) => {
    return await apiRequest<any>('/mesh/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPackets: async (limit?: number) => {
    return await apiRequest<any>(`/mesh/packets?limit=${limit || 50}`);
  },

  getStats: async () => {
    return await apiRequest<any>('/mesh/stats');
  },
};

export const analyticsAPI = {
  getDashboard: async () => {
    return await apiRequest<any>('/analytics/dashboard');
  },

  getHotspots: async (days?: number) => {
    return await apiRequest<{ hotspots: HotspotCluster[] }>(
      `/analytics/hotspots?days=${days || 30}`
    );
  },

  getTrend: async (period?: number, groupBy?: string) => {
    return await apiRequest<any>(
      `/analytics/trend?period=${period || 7}&groupBy=${groupBy || 'day'}`
    );
  },
};

export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return await response.json();
  } catch {
    return null;
  }
};

export const aiAPI = {
  chat: async (message: string) => {
    return await apiRequest<{ reply: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};

export const usersAPI = {
  getAll: async () => {
    return await apiRequest<{ users: User[] }>('/users');
  },
  create: async (data: any) => {
    return await apiRequest<{ user: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: number, data: any) => {
    return await apiRequest<{ user: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  remove: async (id: number) => {
    return await apiRequest<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};
