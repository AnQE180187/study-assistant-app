import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.0.2.2:5000/api', // Thay đổi nếu cần
  timeout: 10000,
});

// Biến để lưu token hiện tại
let currentToken: string | null = null;

// Hàm để cập nhật token (sẽ được gọi từ AuthContext)
export const setAuthToken = (token: string | null) => {
  currentToken = token;
  console.log('Token updated:', token ? 'Token set' : 'Token cleared');
};

// Request interceptor để tự động thêm token
api.interceptors.request.use(
  (config) => {
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
      console.log('Request with token:', config.url);
    } else {
      console.log('Request without token:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi chung
api.interceptors.response.use(
  (response) => {
    console.log('Response success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error.config?.url, error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      console.log('Unauthorized - token may be expired');
      // TODO: Redirect về login hoặc refresh token
    }
    return Promise.reject(error);
  }
);

export default api; 