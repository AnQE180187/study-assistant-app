export interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Schedule {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type StudyMode = 'learn' | 'quiz'; 