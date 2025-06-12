import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/api';

interface Flashcard {
  id: string;
  noteId: string;
  userId: string;
  question: string;
  answer: string;
  difficulty: number;
  lastReviewed?: Date;
  nextReview?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateFlashcardDTO {
  noteId: string;
  question: string;
  answer: string;
  difficulty: number;
}

interface UpdateFlashcardDTO {
  question?: string;
  answer?: string;
  difficulty?: number;
}

class FlashcardService {
  private static async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  private static async getHeaders() {
    const token = await this.getAuthToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  static async createFlashcard(data: CreateFlashcardDTO): Promise<Flashcard> {
    const headers = await this.getHeaders();
    const response = await axios.post(`${API_URL}/flashcards`, data, headers);
    return response.data.data.flashcard;
  }

  static async getFlashcards(): Promise<Flashcard[]> {
    const headers = await this.getHeaders();
    const response = await axios.get(`${API_URL}/flashcards`, headers);
    return response.data.data.flashcards;
  }

  static async getFlashcard(id: string): Promise<Flashcard> {
    const headers = await this.getHeaders();
    const response = await axios.get(`${API_URL}/flashcards/${id}`, headers);
    return response.data.data.flashcard;
  }

  static async updateFlashcard(id: string, data: UpdateFlashcardDTO): Promise<void> {
    const headers = await this.getHeaders();
    await axios.put(`${API_URL}/flashcards/${id}`, data, headers);
  }

  static async deleteFlashcard(id: string): Promise<void> {
    const headers = await this.getHeaders();
    await axios.delete(`${API_URL}/flashcards/${id}`, headers);
  }

  static async getDueFlashcards(): Promise<Flashcard[]> {
    const headers = await this.getHeaders();
    const response = await axios.get(`${API_URL}/flashcards/due`, headers);
    return response.data.data.flashcards;
  }

  static async updateReviewStatus(id: string, difficulty: number): Promise<void> {
    const headers = await this.getHeaders();
    await axios.put(`${API_URL}/flashcards/${id}/review`, { difficulty }, headers);
  }
}

export default FlashcardService; 