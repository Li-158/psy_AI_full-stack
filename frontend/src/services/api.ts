import axios from 'axios';

// API base URL 讀取 .env，如果沒設定就預設 /api（建議你已經設定）
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// 測試用 API 路徑（請自行替換）
export const getSomething = () => {
    return axios.get(`${API_BASE_URL}/api/health`); // 你可以改成你自己的 API 路徑
};

// 測試函式：前端載入時可以直接呼叫來確認連線
export const testApiConnection = () => {
    console.log('目前 API base URL:', API_BASE_URL);
    getSomething()
        .then(response => console.log('✅ API 成功回傳:', response.data))
        .catch(error => console.error('❌ API 連線失敗:', error));
};

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
  return config;
});


// 響應攔截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
};

export const participantAPI = {
  getAll: () => api.get('/participants'),
  create: (data: any) => api.post('/participants', data),
};

export const projectAPI = {
  getAll: () => api.get('/projects'),
};

export default api;
