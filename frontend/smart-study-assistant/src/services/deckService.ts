import api from './api';

export interface Deck {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  flashcards?: any[];
}

export const getDecks = async (): Promise<Deck[]> => {
  const res = await api.get('/decks');
  return res.data;
};

export const getPublicDecks = async (): Promise<Deck[]> => {
  const res = await api.get('/decks/public');
  return res.data;
};

export const getDeckById = async (id: string): Promise<Deck> => {
  const res = await api.get(`/decks/${id}`);
  return res.data;
};

export const createDeck = async (data: Omit<Deck, 'id' | 'createdAt' | 'updatedAt' | 'flashcards'>) => {
  const res = await api.post('/decks', data);
  return res.data;
};

export const updateDeck = async (id: string, data: Partial<Omit<Deck, 'id' | 'createdAt' | 'updatedAt' | 'flashcards'>>) => {
  const res = await api.put(`/decks/${id}`, data);
  return res.data;
};

export const deleteDeck = async (id: string) => {
  const res = await api.delete(`/decks/${id}`);
  return res.data;
}; 