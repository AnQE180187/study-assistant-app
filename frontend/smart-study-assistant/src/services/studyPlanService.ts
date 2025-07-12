import api from './api';

export interface StudyPlan {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  note?: string;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlanStats {
  total: number;
  completed: number;
  upcoming: number;
  completionRate: number;
}

export interface CreateStudyPlanData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  note?: string;
}

export interface UpdateStudyPlanData {
  title?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  note?: string;
  completed?: boolean;
}

// Get all study plans
export const getStudyPlans = async (date?: string): Promise<StudyPlan[]> => {
  const params = date ? { date } : {};
  const res = await api.get('/studyplans', { params });
  return res.data;
};

// Get study plan by ID
export const getStudyPlanById = async (id: string): Promise<StudyPlan> => {
  const res = await api.get(`/studyplans/${id}`);
  return res.data;
};

// Create new study plan
export const createStudyPlan = async (data: CreateStudyPlanData): Promise<StudyPlan> => {
  const res = await api.post('/studyplans', data);
  return res.data;
};

// Update study plan
export const updateStudyPlan = async (id: string, data: UpdateStudyPlanData): Promise<StudyPlan> => {
  const res = await api.put(`/studyplans/${id}`, data);
  return res.data;
};

// Delete study plan
export const deleteStudyPlan = async (id: string): Promise<{ message: string }> => {
  const res = await api.delete(`/studyplans/${id}`);
  return res.data;
};

// Get study plans by date range
export const getStudyPlansByRange = async (startDate: string, endDate: string): Promise<StudyPlan[]> => {
  const res = await api.get('/studyplans/range', { params: { startDate, endDate } });
  return res.data;
};

// Toggle study plan completion
export const toggleStudyPlanCompletion = async (id: string): Promise<StudyPlan> => {
  const res = await api.patch(`/studyplans/${id}/toggle`);
  return res.data;
};

// Get study plan statistics
export const getStudyPlanStats = async (startDate?: string, endDate?: string): Promise<StudyPlanStats> => {
  const params: any = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  const res = await api.get('/studyplans/stats', { params });
  return res.data;
}; 