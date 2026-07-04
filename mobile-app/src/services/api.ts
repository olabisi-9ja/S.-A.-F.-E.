import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://172.31.26.202:5000'; // Local backend URL for physical device testing

const getToken = async () => {
  try {
    return await AsyncStorage.getItem('safe_token');
  } catch (e) {
    return null;
  }
};

export const api = {
  get: async (endpoint: string) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    return res.json();
  },
  post: async (endpoint: string, data: any) => {
    const token = await getToken();
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
