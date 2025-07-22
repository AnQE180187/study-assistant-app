import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUsers = async (search?: string) => {
  const params = search ? { search } : {};
  const res = await axios.get<User[]>(`${API_URL}/api/users`, { params, headers: getAuthHeader() });
  return res.data;
};

export const deleteUser = async (id: string) => {
  await axios.delete(`${API_URL}/api/users/${id}`, { headers: getAuthHeader() });
};

export const promoteUser = async (id: string) => {
  await axios.put(`${API_URL}/api/users/${id}/role`, { role: 'admin' }, { headers: getAuthHeader() });
}; 