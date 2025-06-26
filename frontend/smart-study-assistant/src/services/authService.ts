import api from './api';

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  token: string;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post('/users/login', { email, password });
  return res.data;
};

export const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post('/users', { name, email, password });
  return res.data;
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const res = await api.post('/users/forgot-password', { email });
  return res.data;
};

export const resetPassword = async (email: string, token: string, newPassword: string): Promise<{ message: string }> => {
  const res = await api.post('/users/reset-password', { email, token, newPassword });
  return res.data;
};

export const getProfile = async (token: string): Promise<{ id: string; name: string; email: string; role: string; createdAt: string }> => {
  const res = await api.get('/users/profile', { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}; 