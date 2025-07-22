import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface AiLog {
  id: string;
  user: string;
  prompt: string;
  response: string;
  timestamp: string;
}

export const getAiLogs = async (params?: { date?: string; keyword?: string }) => {
  const res = await axios.get<AiLog[]>(`${API_URL}/api/ai/logs`, { params });
  return res.data;
}; 