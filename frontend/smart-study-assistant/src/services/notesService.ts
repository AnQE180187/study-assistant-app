import api from './api';

export const getNotes = async (token: string) => {
  const response = await api.get('/notes', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createNote = async (data: { title: string; content: string; category: string }, token: string) => {
  const response = await api.post('/notes', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateNote = async (id: string, data: { title: string; content: string; category: string }, token: string) => {
  const response = await api.put(`/notes/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteNote = async (id: string, token: string) => {
  const response = await api.delete(`/notes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}; 