import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Thay đổi nếu cần
  timeout: 10000,
});

export default api; 