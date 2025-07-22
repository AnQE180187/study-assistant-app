import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  flashcards: any[];
}

export const getFlashcardSets = async () => {
  const res = await axios.get<FlashcardSet[]>(`${API_URL}/api/flashcard-sets`);
  return res.data;
};

export const addFlashcardSet = async (data: Omit<FlashcardSet, 'id' | 'flashcards'>) => {
  const res = await axios.post<FlashcardSet>(`${API_URL}/api/flashcard-sets`, data);
  return res.data;
};

export const updateFlashcardSet = async (id: string, data: Partial<FlashcardSet>) => {
  const res = await axios.put<FlashcardSet>(`${API_URL}/api/flashcard-sets/${id}`, data);
  return res.data;
};

export const deleteFlashcardSet = async (id: string) => {
  await axios.delete(`${API_URL}/api/flashcard-sets/${id}`);
};

export const getPublicDecks = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/decks/public`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    console.error('Error fetching public decks:', error);
    return [];
  }
};

export const getFlashcardsByDeckForAdmin = async (deckId: string): Promise<any[]> => {
  try {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${API_URL}/admin/decks/${deckId}/flashcards`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  } catch (error) {
    console.error('Error fetching flashcards for admin:', error);
    return [];
  }
}; 