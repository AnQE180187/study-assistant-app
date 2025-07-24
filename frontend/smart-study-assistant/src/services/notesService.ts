import api from "./api";

export interface Note {
  id: string;
  title: string;
  content: string;
  planId?: string | null;
  priority?: "low" | "medium" | "high" | "urgent";
  tags?: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  planId?: string | null;
  priority?: "low" | "medium" | "high" | "urgent";
  tags?: string[];
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  planId?: string | null;
  priority?: "low" | "medium" | "high" | "urgent";
  tags?: string[];
}

export const getNotes = async (): Promise<Note[]> => {
  const response = await api.get("/notes");
  return response.data;
};

export const getNoteById = async (id: string): Promise<Note> => {
  const response = await api.get(`/notes/${id}`);
  return response.data;
};

export const createNote = async (data: CreateNoteData): Promise<Note> => {
  const response = await api.post("/notes", data);
  return response.data;
};

export const updateNote = async (
  id: string,
  data: UpdateNoteData
): Promise<Note> => {
  const response = await api.put(`/notes/${id}`, data);
  return response.data;
};

export const deleteNote = async (id: string): Promise<void> => {
  await api.delete(`/notes/${id}`);
};

export const getTagSuggestions = async (): Promise<string[]> => {
  const response = await api.get("/notes/tags/suggestions");
  return response.data;
};
