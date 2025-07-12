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

export const sendOtp = async (email: string) => {
  return api.post('/users/send-otp', { email });
};

export const verifyOtpAndRegister = async (email: string, otp: string, password: string) => {
  return api.post('/users/verify-otp', { email, otp, password });
};

export const verifyOtpForgot = async (email: string, otp: string): Promise<{ message: string }> => {
  const res = await api.post('/users/verify-otp-forgot', { email, otp });
  return res.data;
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  role: string;
  language: string;
  theme: string;
  createdAt: string;
}

export const updateProfile = async (data: {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
}): Promise<UserProfile> => {
  const res = await api.put('/users/profile', data);
  return res.data;
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
  const res = await api.put('/users/change-password', { currentPassword, newPassword });
  return res.data;
};

export const updateLanguage = async (language: 'vi' | 'en'): Promise<{ id: string; language: string }> => {
  const res = await api.put('/users/language', { language });
  return res.data;
};

export const updateTheme = async (theme: 'light' | 'dark'): Promise<{ id: string; theme: string }> => {
  const res = await api.put('/users/theme', { theme });
  return res.data;
}; 