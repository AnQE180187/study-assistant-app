export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  education?: string;
  language: string;
  theme: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  users: {
    total: number;
    newLast30Days: number;
    byRole: {
      [key: string]: number;
    };
  };
  content: {
    notes: number;
    decks: number;
    flashcards: number;
    studyPlans: number;
  };
  system: {
    uptime: number;
    nodeVersion: string;
    environment: string;
  };
}

export interface Note {
  id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  tags: string[];
  userId: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Deck {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  isPublic: boolean;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  _count?: {
    flashcards: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  deckId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiLog {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  prompt: string;
  response: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
