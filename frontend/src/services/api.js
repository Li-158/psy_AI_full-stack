import axios from 'axios';

// 修正 API 路徑
const API_BASE_URL = 'http://localhost:3002/api';

console.log('🔌 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 - 移除認證
api.interceptors.request.use((config) => {
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
    console.error('錯誤詳情:', error.response?.data);
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

// 移除認證相關的 API
export const participantAPI = {
  getAll: () => api.get('/participants/public'),  // 使用公開端點
  create: (data) => api.post('/participants/public', data),
  update: (id, data) => api.put(`/participants/public/${id}`, data),
  delete: (id) => api.delete(`/participants/public/${id}`),
};

export const projectAPI = {
  getAll: () => api.get('/projects/public'),  // 使用公開端點
  create: (data) => api.post('/projects/public', data),
  update: (id, data) => api.put(`/projects/public/${id}`, data),
  delete: (id) => api.delete(`/projects/public/${id}`),
};

export default api;
