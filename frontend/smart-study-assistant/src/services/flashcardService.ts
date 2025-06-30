import api from "./api";

// Types based on Prisma schema
export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  deckId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardDeck {
  deckId: string;
  deckTitle: string;
  category: string;
  flashcards: Flashcard[];
  totalCards: number;
}

export interface CreateFlashcardData {
  term: string;
  definition: string;
  deckId: string;
}

// Get all flashcard decks grouped by deck
export const getFlashcardDecks = async (): Promise<FlashcardDeck[]> => {
  try {
    const response = await api.get('/decks');
    const decks = response.data;
    
    return decks.map((deck: any) => ({
      deckId: deck.id,
      deckTitle: deck.title,
      category: deck.tags.join(', ') || 'General',
      flashcards: deck.flashcards || [],
      totalCards: deck.flashcards?.length || 0,
    }));
  } catch (error) {
    console.error("Error fetching flashcard decks:", error);
    throw error;
  }
};

// Get flashcards by deck ID
export const getFlashcardsByDeck = async (deckId: string): Promise<Flashcard[]> => {
  try {
    const response = await api.get(`/decks/${deckId}/flashcards`);
    return response.data;
  } catch (error) {
    console.error("Error fetching flashcards by deck:", error);
    throw error;
  }
};

// Get public flashcards by deck ID (for viewing public decks)
export const getPublicFlashcardsByDeck = async (deckId: string): Promise<Flashcard[]> => {
  try {
    const response = await api.get(`/decks/${deckId}/flashcards/public`);
    return response.data;
  } catch (error) {
    console.error("Error fetching public flashcards by deck:", error);
    throw error;
  }
};

// Create new flashcard
export const createFlashcard = async (deckId: string, data: { term: string; definition: string; }) => {
  const res = await api.post(`/decks/${deckId}/flashcards`, data);
  return res.data;
};

// Update flashcard
export const updateFlashcard = async (id: string, data: { term: string; definition: string; }) => {
  const res = await api.put(`/flashcards/${id}`, data);
  return res.data;
};

// Delete flashcard
export const deleteFlashcard = async (id: string) => {
  const res = await api.delete(`/flashcards/${id}`);
  return res.data;
};

// Get flashcard by ID
export const getFlashcardById = async (id: string): Promise<Flashcard> => {
  const res = await api.get(`/flashcards/${id}`);
  return res.data;
};

// Search flashcards
export const searchFlashcards = async (query: string): Promise<Flashcard[]> => {
  try {
    const response = await api.get(`/flashcards/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error("Error searching flashcards:", error);
    throw error;
  }
};

// Get flashcard statistics
export const getFlashcardStats = async (): Promise<{
  totalCards: number;
  totalDecks: number;
  categoriesCount: Record<string, number>;
  recentActivity: number;
}> => {
  try {
    const response = await api.get('/flashcards/stats');
    return response.data;
  } catch (error) {
    console.error("Error fetching flashcard stats:", error);
    throw error;
  }
};

// Bulk operations
export const bulkDeleteFlashcards = async (ids: string[]): Promise<void> => {
  const res = await api.delete('/flashcards/bulk', { data: { ids } });
  return res.data;
};

export const bulkUpdateFlashcards = async (
  updates: Array<{ id: string; data: Partial<CreateFlashcardData> }>
): Promise<Flashcard[]> => {
  const res = await api.put('/flashcards/bulk', { updates });
  return res.data;
};

// Export/Import
export const exportFlashcards = async (deckId?: string): Promise<string> => {
  const url = deckId ? `/flashcards/export?deckId=${deckId}` : '/flashcards/export';
  const res = await api.get(url);
  return res.data;
};

export const importFlashcards = async (
  data: string,
  deckId: string
): Promise<Flashcard[]> => {
  const res = await api.post('/flashcards/import', { data, deckId });
  return res.data;
};
