import api from './api';

// Types based on Prisma schema
export interface Note {
  id: string;
  title: string;
  description?: string;
  content: string;
  tags: string[];
  category: string;
  priority: 'low' | 'medium' | 'high';
  color?: string;
  isPublic: boolean;
  isPinned: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  title: string;
  description?: string;
  content: string;
  tags?: string[];
  category: string;
  priority?: 'low' | 'medium' | 'high';
  color?: string;
  isPublic?: boolean;
  isPinned?: boolean;
}

export interface UpdateNoteData extends Partial<CreateNoteData> {}

export interface NoteStats {
  totalNotes: number;
  pinnedNotes: number;
  publicNotes: number;
  priorityStats: Array<{ priority: string; _count: { priority: number } }>;
  categoryStats: Array<{ category: string; _count: { category: number } }>;
  recentActivity: number;
}

// Get all notes with filtering
export const getNotes = async (params?: {
  search?: string;
  tags?: string[];
  category?: string;
  priority?: string;
  isPinned?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<Note[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params?.category) queryParams.append('category', params.category);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.isPinned !== undefined) queryParams.append('isPinned', params.isPinned.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/notes?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }
};

// Get public notes
export const getPublicNotes = async (params?: {
  search?: string;
  tags?: string[];
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<Note[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
    if (params?.category) queryParams.append('category', params.category);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/notes/public?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching public notes:", error);
    throw error;
  }
};

// Get note by ID
export const getNoteById = async (id: string): Promise<Note> => {
  try {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching note by ID:", error);
    throw error;
  }
};

// Create new note
export const createNote = async (data: CreateNoteData): Promise<Note> => {
  try {
    const response = await api.post('/notes', data);
    return response.data;
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

// Update note
export const updateNote = async (id: string, data: UpdateNoteData): Promise<Note> => {
  try {
    const response = await api.put(`/notes/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};

// Delete note
export const deleteNote = async (id: string): Promise<void> => {
  try {
    await api.delete(`/notes/${id}`);
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

// Toggle pin status
export const togglePin = async (id: string): Promise<Note> => {
  try {
    const response = await api.patch(`/notes/${id}/toggle-pin`);
    return response.data;
  } catch (error) {
    console.error("Error toggling pin:", error);
    throw error;
  }
};

// Get note statistics
export const getNoteStats = async (): Promise<NoteStats> => {
  try {
    const response = await api.get('/notes/stats');
    return response.data;
  } catch (error) {
    console.error("Error fetching note stats:", error);
    throw error;
  }
};

// Get all categories for the user
export const getCategories = async (): Promise<string[]> => {
  try {
    const response = await api.get('/notes/categories');
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

// Bulk delete notes
export const bulkDeleteNotes = async (ids: string[]): Promise<void> => {
  try {
    await api.delete('/notes/bulk', { data: { ids } });
  } catch (error) {
    console.error("Error bulk deleting notes:", error);
    throw error;
  }
}; 