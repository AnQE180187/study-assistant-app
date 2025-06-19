import api from './api';

export const getFlashcardDecks = async () => {
  const response = await api.get('/flashcards');
  return response.data;
}; 