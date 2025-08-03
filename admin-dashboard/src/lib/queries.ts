import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { AdminStats, User, Note, Deck, Flashcard, AiLog } from '@/types';

// Query keys
export const queryKeys = {
  stats: ['admin', 'stats'] as const,
  users: ['admin', 'users'] as const,
  user: (id: string) => ['admin', 'users', id] as const,
  notes: ['admin', 'notes'] as const,
  decks: ['admin', 'decks'] as const,
  deck: (id: string) => ['admin', 'decks', id] as const,
  flashcards: (deckId: string) => ['admin', 'flashcards', deckId] as const,
  aiLogs: ['admin', 'ai-logs'] as const,
};

// Stats queries
export const useAdminStats = () => {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: async (): Promise<AdminStats> => {
      const response = await api.get('/users/admin/stats');
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Users queries
export const useUsers = (search?: string) => {
  return useQuery({
    queryKey: [...queryKeys.users, search],
    queryFn: async (): Promise<User[]> => {
      const params = search ? { search } : {};
      const response = await api.get('/users', { params });
      return response.data;
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await api.put(`/users/${userId}/role`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

// Notes queries
export const useNotes = () => {
  return useQuery({
    queryKey: queryKeys.notes,
    queryFn: async (): Promise<Note[]> => {
      const response = await api.get('/notes/all');
      return response.data;
    },
  });
};

// Decks queries
export const useDecks = () => {
  return useQuery({
    queryKey: queryKeys.decks,
    queryFn: async (): Promise<Deck[]> => {
      const response = await api.get('/decks/all');
      return response.data;
    },
  });
};

export const useFlashcards = (deckId: string) => {
  return useQuery({
    queryKey: queryKeys.flashcards(deckId),
    queryFn: async (): Promise<Flashcard[]> => {
      const response = await api.get(`/admin/decks/${deckId}/flashcards`);
      return response.data;
    },
    enabled: !!deckId,
  });
};

// AI Logs queries
export const useAiLogs = () => {
  return useQuery({
    queryKey: queryKeys.aiLogs,
    queryFn: async (): Promise<AiLog[]> => {
      const response = await api.get('/ai/logs');
      return response.data;
    },
  });
};

export const useDeleteAiLog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (logId: string) => {
      await api.delete(`/ai/logs/${logId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aiLogs });
    },
  });
};
