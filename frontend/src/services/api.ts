import axios from 'axios';

// 在容器環境中使用相對路徑
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

console.log('🔌 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 測試 API 連接
export const testApiConnection = async () => {
  try {
    console.log('🧪 測試 API 連接...');
    const response = await api.get('/health');
    console.log('✅ API 連接成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API 連接失敗:', error);
    throw error;
  }
};

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
};

export const participantAPI = {
  getAll: () => api.get('/participants'),
  create: (data: any) => api.post('/participants', data),
  update: (id: string, data: any) => api.put(`/participants/${id}`, data),
  delete: (id: string) => api.delete(`/participants/${id}`),
};

export const projectAPI = {
  getAll: () => api.get('/projects'),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

export default api;
