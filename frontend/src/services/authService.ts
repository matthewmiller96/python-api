import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export const authService = {
  setToken: (token: string | null) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('authToken', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('authToken');
    }
  },

  login: async (username: string, password: string): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    authService.setToken(response.data.access_token);
    return response.data;
  },

  register: async (userData: RegisterData): Promise<User> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};

export default api;
