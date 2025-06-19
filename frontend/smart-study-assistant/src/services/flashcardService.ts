import api from "./api";

// Types based on Prisma schema
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  noteId: string;
  userId: string;
  createdAt: string;
  note?: {
    id: string;
    title: string;
    category: string;
  };
}

export interface FlashcardDeck {
  noteId: string;
  noteTitle: string;
  category: string;
  flashcards: Flashcard[];
  totalCards: number;
}

export interface CreateFlashcardData {
  question: string;
  answer: string;
  noteId: string;
}

// Mock data for development
const mockFlashcards: Flashcard[] = [
  {
    id: "1",
    question: "What is React Native?",
    answer: "React Native is a framework for building mobile apps using React",
    noteId: "note1",
    userId: "user1",
    createdAt: "2024-01-15T10:00:00Z",
    note: {
      id: "note1",
      title: "React Native Basics",
      category: "Programming",
    },
  },
  {
    id: "2",
    question: "What is TypeScript?",
    answer: "TypeScript is a superset of JavaScript that adds static typing",
    noteId: "note1",
    userId: "user1",
    createdAt: "2024-01-15T10:05:00Z",
    note: {
      id: "note1",
      title: "React Native Basics",
      category: "Programming",
    },
  },
  {
    id: "3",
    question: "What is JSX?",
    answer:
      "JSX is a syntax extension for JavaScript that allows you to write HTML-like code in React",
    noteId: "note1",
    userId: "user1",
    createdAt: "2024-01-15T10:10:00Z",
    note: {
      id: "note1",
      title: "React Native Basics",
      category: "Programming",
    },
  },
  {
    id: "4",
    question: "What is Prisma?",
    answer: "Prisma is a modern database toolkit for TypeScript and Node.js",
    noteId: "note2",
    userId: "user1",
    createdAt: "2024-01-15T11:00:00Z",
    note: {
      id: "note2",
      title: "Database Technologies",
      category: "Backend",
    },
  },
  {
    id: "5",
    question: "What is MongoDB?",
    answer: "MongoDB is a NoSQL document database",
    noteId: "note2",
    userId: "user1",
    createdAt: "2024-01-15T11:05:00Z",
    note: {
      id: "note2",
      title: "Database Technologies",
      category: "Backend",
    },
  },
  {
    id: "6",
    question: "What is an ORM?",
    answer:
      "Object-Relational Mapping (ORM) is a technique that lets you query and manipulate data from a database using an object-oriented paradigm",
    noteId: "note2",
    userId: "user1",
    createdAt: "2024-01-15T11:10:00Z",
    note: {
      id: "note2",
      title: "Database Technologies",
      category: "Backend",
    },
  },
  {
    id: "7",
    question: "What is Machine Learning?",
    answer:
      "Machine Learning is a subset of AI that enables computers to learn and make decisions from data without being explicitly programmed",
    noteId: "note3",
    userId: "user1",
    createdAt: "2024-01-16T09:00:00Z",
    note: {
      id: "note3",
      title: "AI & Machine Learning",
      category: "Data Science",
    },
  },
  {
    id: "8",
    question: "What is Deep Learning?",
    answer:
      "Deep Learning is a subset of machine learning that uses neural networks with multiple layers to model and understand complex patterns",
    noteId: "note3",
    userId: "user1",
    createdAt: "2024-01-16T09:05:00Z",
    note: {
      id: "note3",
      title: "AI & Machine Learning",
      category: "Data Science",
    },
  },
  {
    id: "9",
    question: "What is a Neural Network?",
    answer:
      "A neural network is a computing system inspired by biological neural networks, consisting of interconnected nodes (neurons) that process information",
    noteId: "note3",
    userId: "user1",
    createdAt: "2024-01-16T09:10:00Z",
    note: {
      id: "note3",
      title: "AI & Machine Learning",
      category: "Data Science",
    },
  },
  {
    id: "10",
    question: "What is Redux?",
    answer:
      "Redux is a predictable state container for JavaScript apps, commonly used with React for managing application state",
    noteId: "note4",
    userId: "user1",
    createdAt: "2024-01-17T14:00:00Z",
    note: {
      id: "note4",
      title: "State Management",
      category: "Frontend",
    },
  },
  {
    id: "11",
    question: "What is Context API?",
    answer:
      "Context API is a React feature that allows you to share state between components without prop drilling",
    noteId: "note4",
    userId: "user1",
    createdAt: "2024-01-17T14:05:00Z",
    note: {
      id: "note4",
      title: "State Management",
      category: "Frontend",
    },
  },
  {
    id: "12",
    question: "What is RESTful API?",
    answer:
      "REST (Representational State Transfer) is an architectural style for designing networked applications, using HTTP methods like GET, POST, PUT, DELETE",
    noteId: "note5",
    userId: "user1",
    createdAt: "2024-01-18T16:00:00Z",
    note: {
      id: "note5",
      title: "API Design",
      category: "Backend",
    },
  },
  {
    id: "13",
    question: "What is GraphQL?",
    answer:
      "GraphQL is a query language and runtime for APIs that allows clients to request exactly the data they need",
    noteId: "note5",
    userId: "user1",
    createdAt: "2024-01-18T16:05:00Z",
    note: {
      id: "note5",
      title: "API Design",
      category: "Backend",
    },
  },
];

// Get all flashcard decks grouped by notes
export const getFlashcardDecks = async (): Promise<FlashcardDeck[]> => {
  try {
    // In real app, this would be: const response = await api.get('/flashcards/decks');
    // For now, using mock data
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

    const groupedFlashcards = mockFlashcards.reduce((acc, flashcard) => {
      const noteId = flashcard.noteId;
      if (!acc[noteId]) {
        acc[noteId] = {
          noteId,
          noteTitle: flashcard.note?.title || "Unknown Note",
          category: flashcard.note?.category || "General",
          flashcards: [],
          totalCards: 0,
        };
      }
      acc[noteId].flashcards.push(flashcard);
      acc[noteId].totalCards++;
      return acc;
    }, {} as Record<string, FlashcardDeck>);

    return Object.values(groupedFlashcards);
  } catch (error) {
    console.error("Error fetching flashcard decks:", error);
    throw error;
  }
};

// Get flashcards by note ID
export const getFlashcardsByNote = async (
  noteId: string
): Promise<Flashcard[]> => {
  try {
    // In real app: const response = await api.get(`/flashcards/note/${noteId}`);
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockFlashcards.filter((card) => card.noteId === noteId);
  } catch (error) {
    console.error("Error fetching flashcards by note:", error);
    throw error;
  }
};

// Create new flashcard
export const createFlashcard = async (
  data: CreateFlashcardData
): Promise<Flashcard> => {
  try {
    // In real app: const response = await api.post('/flashcards', data);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newFlashcard: Flashcard = {
      id: Date.now().toString(),
      question: data.question,
      answer: data.answer,
      noteId: data.noteId,
      userId: "user1",
      createdAt: new Date().toISOString(),
    };

    mockFlashcards.push(newFlashcard);
    return newFlashcard;
  } catch (error) {
    console.error("Error creating flashcard:", error);
    throw error;
  }
};

// Update flashcard
export const updateFlashcard = async (
  id: string,
  data: Partial<CreateFlashcardData>
): Promise<Flashcard> => {
  try {
    // In real app: const response = await api.put(`/flashcards/${id}`, data);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = mockFlashcards.findIndex((card) => card.id === id);
    if (index === -1) throw new Error("Flashcard not found");

    mockFlashcards[index] = { ...mockFlashcards[index], ...data };
    return mockFlashcards[index];
  } catch (error) {
    console.error("Error updating flashcard:", error);
    throw error;
  }
};

// Delete flashcard
export const deleteFlashcard = async (id: string): Promise<void> => {
  try {
    // In real app: await api.delete(`/flashcards/${id}`);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const index = mockFlashcards.findIndex((card) => card.id === id);
    if (index === -1) throw new Error("Flashcard not found");

    mockFlashcards.splice(index, 1);
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    throw error;
  }
};

// Generate flashcards from note content (AI feature)
export const generateFlashcardsFromNote = async (
  noteId: string,
  noteContent: string
): Promise<Flashcard[]> => {
  try {
    // In real app: const response = await api.post('/flashcards/generate', { noteId, content: noteContent });
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate AI processing time

    // Mock AI-generated flashcards based on content analysis
    const generatedCards: CreateFlashcardData[] = [
      {
        question: "What is the main topic discussed in this note?",
        answer: "Generated answer based on note content analysis",
        noteId,
      },
      {
        question: "What are the key concepts mentioned?",
        answer: "Generated summary of key concepts and definitions",
        noteId,
      },
      {
        question: "How does this relate to practical applications?",
        answer: "Generated explanation of real-world usage and examples",
        noteId,
      },
    ];

    const flashcards: Flashcard[] = [];
    for (const cardData of generatedCards) {
      const newCard = await createFlashcard(cardData);
      flashcards.push(newCard);
    }

    return flashcards;
  } catch (error) {
    console.error("Error generating flashcards:", error);
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
    await new Promise((resolve) => setTimeout(resolve, 200));

    const decks = await getFlashcardDecks();
    const categoriesCount = decks.reduce((acc, deck) => {
      acc[deck.category] = (acc[deck.category] || 0) + deck.totalCards;
      return acc;
    }, {} as Record<string, number>);

    // Count cards created in last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivity = mockFlashcards.filter(
      (card) => new Date(card.createdAt) > weekAgo
    ).length;

    return {
      totalCards: mockFlashcards.length,
      totalDecks: decks.length,
      categoriesCount,
      recentActivity,
    };
  } catch (error) {
    console.error("Error fetching flashcard stats:", error);
    throw error;
  }
};

// Search flashcards
export const searchFlashcards = async (query: string): Promise<Flashcard[]> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];

    return mockFlashcards.filter(
      (card) =>
        card.question.toLowerCase().includes(searchTerm) ||
        card.answer.toLowerCase().includes(searchTerm) ||
        card.note?.title.toLowerCase().includes(searchTerm) ||
        card.note?.category.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error("Error searching flashcards:", error);
    throw error;
  }
};

// Get flashcards by difficulty (based on user ratings - mock implementation)
export const getFlashcardsByDifficulty = async (
  difficulty: "easy" | "medium" | "hard"
): Promise<Flashcard[]> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock implementation - in real app, this would be based on user rating history
    const difficultyMap = {
      easy: mockFlashcards.slice(0, 5),
      medium: mockFlashcards.slice(5, 10),
      hard: mockFlashcards.slice(10),
    };

    return difficultyMap[difficulty] || [];
  } catch (error) {
    console.error("Error fetching flashcards by difficulty:", error);
    throw error;
  }
};

// Bulk operations
export const bulkDeleteFlashcards = async (ids: string[]): Promise<void> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    ids.forEach((id) => {
      const index = mockFlashcards.findIndex((card) => card.id === id);
      if (index !== -1) {
        mockFlashcards.splice(index, 1);
      }
    });
  } catch (error) {
    console.error("Error bulk deleting flashcards:", error);
    throw error;
  }
};

export const bulkUpdateFlashcards = async (
  updates: Array<{ id: string; data: Partial<CreateFlashcardData> }>
): Promise<Flashcard[]> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedCards: Flashcard[] = [];

    updates.forEach(({ id, data }) => {
      const index = mockFlashcards.findIndex((card) => card.id === id);
      if (index !== -1) {
        mockFlashcards[index] = { ...mockFlashcards[index], ...data };
        updatedCards.push(mockFlashcards[index]);
      }
    });

    return updatedCards;
  } catch (error) {
    console.error("Error bulk updating flashcards:", error);
    throw error;
  }
};

// Export/Import functionality (mock)
export const exportFlashcards = async (noteId?: string): Promise<string> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const cardsToExport = noteId
      ? mockFlashcards.filter((card) => card.noteId === noteId)
      : mockFlashcards;

    // In real app, this would return a downloadable file URL or content
    return JSON.stringify(cardsToExport, null, 2);
  } catch (error) {
    console.error("Error exporting flashcards:", error);
    throw error;
  }
};

export const importFlashcards = async (
  data: string,
  noteId: string
): Promise<Flashcard[]> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const importedData = JSON.parse(data) as Flashcard[];
    const newFlashcards: Flashcard[] = [];

    for (const cardData of importedData) {
      const newCard = await createFlashcard({
        question: cardData.question,
        answer: cardData.answer,
        noteId,
      });
      newFlashcards.push(newCard);
    }

    return newFlashcards;
  } catch (error) {
    console.error("Error importing flashcards:", error);
    throw error;
  }
};
