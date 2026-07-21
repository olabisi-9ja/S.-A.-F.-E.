import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://s-a-f-e.onrender.com';

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('safe_token');
  } catch (e) {
    return null;
  }
};

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const token = await getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
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
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ─── Auth ────────────────────────────────────────────────────
export const authAPI = {
  login: async (email: string, password: string) =>
    apiRequest<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ institutional_email: email, password }),
    }),

  register: async (data: {
    full_name: string;
    institutional_email: string;
    password: string;
    phone: string;
    matric_or_staff_id: string;
  }) =>
    apiRequest<{ user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: async () => apiRequest<{ user: any }>('/api/auth/profile'),

  updateProfile: async (data: { full_name?: string; phone?: string; push_token?: string }) =>
    apiRequest<{ user: any }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  logout: async () =>
    apiRequest('/api/auth/logout', { method: 'POST' }),
};

// ─── Alerts ──────────────────────────────────────────────────
export const alertsAPI = {
  trigger: async (
    latitude: number,
    longitude: number,
    transmission_mode: 'https' | 'mesh' = 'https'
  ) =>
    apiRequest<{ alert: any }>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, transmission_mode }),
    }),

  getAll: async (params?: { resolved?: boolean; acknowledged?: boolean; limit?: number }) => {
    const qp = new URLSearchParams();
    if (params?.resolved !== undefined) qp.append('resolved', String(params.resolved));
    if (params?.acknowledged !== undefined) qp.append('acknowledged', String(params.acknowledged));
    if (params?.limit) qp.append('limit', String(params.limit));
    return apiRequest<{ alerts: any[]; total: number }>(`/api/alerts?${qp.toString()}`);
  },

  getActive: async () =>
    apiRequest<{ alerts: any[]; count: number }>('/api/alerts/active'),

  acknowledge: async (id: number) =>
    apiRequest(`/api/alerts/${id}/acknowledge`, { method: 'POST' }),

  resolve: async (id: number) =>
    apiRequest(`/api/alerts/${id}/resolve`, { method: 'POST' }),

  getById: async (id: number | string) =>
    apiRequest<{ alert: any }>(`/api/alerts/track/${id}`),
};

// ─── Incidents ───────────────────────────────────────────────
export const incidentsAPI = {
  create: async (data: {
    category: string;
    description: string;
    latitude: number;
    longitude: number;
    media_url?: string;
  }) =>
    apiRequest<{ incident: any; ai_classification: any }>('/api/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: async (params?: { status?: string; category?: string; limit?: number; offset?: number }) => {
    const qp = new URLSearchParams();
    if (params?.status) qp.append('status', params.status);
    if (params?.category) qp.append('category', params.category);
    if (params?.limit) qp.append('limit', String(params.limit));
    if (params?.offset) qp.append('offset', String(params.offset));
    return apiRequest<{ incidents: any[]; total: number }>(`/api/incidents?${qp.toString()}`);
  },

  getById: async (id: number) =>
    apiRequest<{ incident: any }>(`/api/incidents/${id}`),

  getStats: async (period?: number) =>
    apiRequest<any>(`/api/incidents/stats?period=${period || 7}`),

  // Preview the AI's suggested category/severity before final submission,
  // so the user can confirm or override it.
  classify: async (description: string) =>
    apiRequest<{
      ai_classification: {
        ai_category_suggestion: string;
        ai_severity_score: number;
        ai_is_suspicious: boolean;
      };
    }>('/api/incidents/classify', {
      method: 'POST',
      body: JSON.stringify({ description }),
    }),
};

// ─── Messages ────────────────────────────────────────────────
export const messagesAPI = {
  send: async (incident_id: number, content: string) =>
    apiRequest<{ message: any }>('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ incident_id, content }),
    }),

  getByIncident: async (incident_id: number) =>
    apiRequest<{ messages: any[] }>(`/api/messages/incident/${incident_id}`),

  markRead: async (id: number) =>
    apiRequest(`/api/messages/${id}/read`, { method: 'PATCH' }),
};

// ─── Mesh (offline relay sync) ──────────────────────────────
export const meshAPI = {
  sync: async (payload: {
    encrypted_payload: string;
    ttl: number;
    origin_device_id: string;
    relay_device_id?: string;
    hop_count?: number;
  }) =>
    apiRequest<{ alert: any; mesh_packet: any }>('/api/mesh/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// ─── Analytics ───────────────────────────────────────────────
export const analyticsAPI = {
  getDashboard: async () => apiRequest<any>('/api/analytics/dashboard'),

  getHotspots: async (days?: number) =>
    apiRequest<{ hotspots: any[] }>(`/api/analytics/hotspots?days=${days || 30}`),

  getTrend: async (period?: number, groupBy?: string) =>
    apiRequest<any>(`/api/analytics/trend?period=${period || 7}&groupBy=${groupBy || 'day'}`),
};

// ─── AI ──────────────────────────────────────────────────────
export const aiAPI = {
  chat: async (message: string) =>
    apiRequest<{ reply: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

// ─── Legacy export for backward compat ───────────────────────
export const api = {
  get: async (endpoint: string) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return res.json();
  },
  post: async (endpoint: string, data: any) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
