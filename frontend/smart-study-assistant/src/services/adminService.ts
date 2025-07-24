import api from "./api";

// Types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  education?:
    | "ELEMENTARY"
    | "MIDDLE_SCHOOL"
    | "HIGH_SCHOOL"
    | "UNIVERSITY"
    | "GRADUATE"
    | "OTHER";
  gender?: string;
  dateOfBirth?: string;
  language?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    notes: number;
    decks: number;
    studyPlans: number;
  };
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
  // Legacy fields for backward compatibility
  totalUsers?: number;
  totalDecks?: number;
  totalFlashcards?: number;
  totalAiLogs?: number;
  recentUsers?: AdminUser[];
}

export interface PublicDeck {
  id: string;
  name: string; // Backend uses 'name' not 'title'
  title?: string; // Keep for backward compatibility
  description: string;
  _count?: {
    flashcards: number;
  };
  user?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
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

export interface AdminFlashcard {
  id: string;
  term: string;
  definition: string;
  createdAt: string;
  updatedAt: string;
}

// Admin User Management
export const getAdminUsers = async (search?: string): Promise<AdminUser[]> => {
  try {
    const params = search ? { search } : {};
    const response = await api.get("/users", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin users:", error);
    throw error;
  }
};

export const deleteAdminUser = async (userId: string): Promise<void> => {
  try {
    await api.delete(`/users/${userId}`);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const updateUserRole = async (
  userId: string,
  role: "USER" | "ADMIN"
): Promise<AdminUser> => {
  try {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data.user;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// Legacy function for backward compatibility
export const promoteUserToAdmin = async (
  userId: string
): Promise<AdminUser> => {
  return updateUserRole(userId, "ADMIN");
};

// Admin Stats
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const response = await api.get("/users/admin/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
};

// Get Recent Users
export const getRecentUsers = async (
  limit: number = 5
): Promise<AdminUser[]> => {
  try {
    // Use the working /users endpoint and sort client-side
    const usersResponse = await api.get("/users");
    const allUsers = usersResponse.data || [];
    console.log("Got all users from /users endpoint:", allUsers.length);

    // Sort by createdAt descending and take first 'limit' items
    const sortedUsers = allUsers
      .sort((a: AdminUser, b: AdminUser) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, limit);

    console.log("Recent users after sorting:", sortedUsers.length);
    return sortedUsers;
  } catch (error) {
    console.error("Error fetching recent users:", error);
    return [];
  }
};

// Admin Flashcard Management
export const getPublicDecks = async (): Promise<PublicDeck[]> => {
  try {
    const response = await api.get("/decks/public");
    return response.data;
  } catch (error) {
    console.error("Error fetching public decks:", error);
    throw error;
  }
};

export const getAllDecksAdmin = async (): Promise<PublicDeck[]> => {
  try {
    const response = await api.get("/decks/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching all decks for admin:", error);
    throw error;
  }
};

export const getAdminFlashcardsByDeck = async (
  deckId: string
): Promise<AdminFlashcard[]> => {
  try {
    const response = await api.get(
      `/flashcards/admin/decks/${deckId}/flashcards`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching admin flashcards:", error);
    throw error;
  }
};

// Create a new flashcard
export const createFlashcard = async (
  deckId: string,
  data: { term: string; definition: string }
): Promise<AdminFlashcard> => {
  try {
    const response = await api.post(`/flashcards`, {
      ...data,
      deckId,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating flashcard:", error);
    throw error;
  }
};

// Update a flashcard
export const updateFlashcard = async (
  flashcardId: string,
  data: { term?: string; definition?: string }
): Promise<AdminFlashcard> => {
  try {
    const response = await api.put(`/flashcards/${flashcardId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating flashcard:", error);
    throw error;
  }
};

// Delete a flashcard
export const deleteFlashcard = async (flashcardId: string): Promise<void> => {
  try {
    await api.delete(`/flashcards/${flashcardId}`);
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    throw error;
  }
};

// Admin AI Logs
export const getAiLogs = async (
  page = 1,
  limit = 20,
  search?: string
): Promise<{ logs: AiLog[]; total: number }> => {
  try {
    const params: any = { page, limit };
    if (search) params.search = search;

    const response = await api.get("/ai/logs", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching AI logs:", error);
    throw error;
  }
};

export const deleteAiLog = async (logId: string): Promise<void> => {
  try {
    await api.delete(`/ai/logs/${logId}`);
  } catch (error) {
    console.error("Error deleting AI log:", error);
    throw error;
  }
};
