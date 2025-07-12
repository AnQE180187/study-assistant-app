import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  Flashcard,
  FlashcardDeck,
  getFlashcardDecks,
  getFlashcardsByNote,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  CreateFlashcardData,
} from "../services/flashcardService";

interface FlashcardState {
  decks: FlashcardDeck[];
  currentFlashcards: Flashcard[];
  loading: boolean;
  error: string | null;
  studySession: {
    currentIndex: number;
    ratings: Record<string, "easy" | "medium" | "hard">;
    completedCards: string[];
    isActive: boolean;
  };
}

const initialState: FlashcardState = {
  decks: [],
  currentFlashcards: [],
  loading: false,
  error: null,
  studySession: {
    currentIndex: 0,
    ratings: {},
    completedCards: [],
    isActive: false,
  },
};

// Async thunks
export const fetchFlashcardDecks = createAsyncThunk(
  "flashcards/fetchDecks",
  async () => {
    const decks = await getFlashcardDecks();
    return decks;
  }
);

export const fetchFlashcardsByNote = createAsyncThunk(
  "flashcards/fetchByNote",
  async (noteId: string) => {
    const flashcards = await getFlashcardsByNote(noteId);
    return flashcards;
  }
);

export const createFlashcardAsync = createAsyncThunk(
  "flashcards/create",
  async (data: { deckId: string; term: string; definition: string }) => {
    const flashcard = await createFlashcard(data.deckId, {
      term: data.term,
      definition: data.definition,
    });
    return flashcard;
  }
);

export const updateFlashcardAsync = createAsyncThunk(
  "flashcards/update",
  async ({ id, data }: { id: string; data: { term: string; definition: string } }) => {
    const flashcard = await updateFlashcard(id, data);
    return flashcard;
  }
);

export const deleteFlashcardAsync = createAsyncThunk(
  "flashcards/delete",
  async (id: string) => {
    await deleteFlashcard(id);
    return id;
  }
);

const flashcardSlice = createSlice({
  name: "flashcards",
  initialState,
  reducers: {
    // Study session actions
    startStudySession: (state, action: PayloadAction<Flashcard[]>) => {
      state.studySession = {
        currentIndex: 0,
        ratings: {},
        completedCards: [],
        isActive: true,
      };
      state.currentFlashcards = action.payload;
    },

    endStudySession: (state) => {
      state.studySession = {
        currentIndex: 0,
        ratings: {},
        completedCards: [],
        isActive: false,
      };
    },

    setCurrentCardIndex: (state, action: PayloadAction<number>) => {
      state.studySession.currentIndex = action.payload;
    },

    rateCard: (
      state,
      action: PayloadAction<{
        cardId: string;
        rating: "easy" | "medium" | "hard";
      }>
    ) => {
      const { cardId, rating } = action.payload;
      state.studySession.ratings[cardId] = rating;
      if (!state.studySession.completedCards.includes(cardId)) {
        state.studySession.completedCards.push(cardId);
      }
    },

    shuffleFlashcards: (state) => {
      // Simple shuffle algorithm
      const shuffled = [...state.currentFlashcards];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      state.currentFlashcards = shuffled;
      state.studySession.currentIndex = 0;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Legacy actions for backward compatibility
    setDecks: (state, action: PayloadAction<FlashcardDeck[]>) => {
      state.decks = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch decks
      .addCase(fetchFlashcardDecks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlashcardDecks.fulfilled, (state, action) => {
        state.loading = false;
        state.decks = action.payload;
      })
      .addCase(fetchFlashcardDecks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch flashcard decks";
      })

      // Fetch flashcards by note
      .addCase(fetchFlashcardsByNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFlashcardsByNote.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFlashcards = action.payload;
      })
      .addCase(fetchFlashcardsByNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch flashcards";
      })

      // Create flashcard
      .addCase(createFlashcardAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFlashcardAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFlashcards.push(action.payload);

        // Update decks
        const deckId = action.payload.deckId;
        const deckIndex = state.decks.findIndex(
          (deck) => deck.deckId === deckId
        );
        if (deckIndex !== -1) {
          state.decks[deckIndex].flashcards.push(action.payload);
          state.decks[deckIndex].totalCards += 1;
        }
      })
      .addCase(createFlashcardAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create flashcard";
      })

      // Update flashcard
      .addCase(updateFlashcardAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFlashcardAsync.fulfilled, (state, action) => {
        state.loading = false;
        const flashcard = action.payload;

        // Update in current flashcards
        const currentIndex = state.currentFlashcards.findIndex(
          (card) => card.id === flashcard.id
        );
        if (currentIndex !== -1) {
          state.currentFlashcards[currentIndex] = flashcard;
        }

        // Update in decks
        const deckIndex = state.decks.findIndex(
          (deck) => deck.deckId === flashcard.deckId
        );
        if (deckIndex !== -1) {
          const cardIndex = state.decks[deckIndex].flashcards.findIndex(
            (card) => card.id === flashcard.id
          );
          if (cardIndex !== -1) {
            state.decks[deckIndex].flashcards[cardIndex] = flashcard;
          }
        }
      })
      .addCase(updateFlashcardAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update flashcard";
      })

      // Delete flashcard
      .addCase(deleteFlashcardAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFlashcardAsync.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;

        // Remove from current flashcards
        state.currentFlashcards = state.currentFlashcards.filter(
          (card) => card.id !== deletedId
        );

        // Remove from decks
        state.decks.forEach((deck) => {
          const originalLength = deck.flashcards.length;
          deck.flashcards = deck.flashcards.filter(
            (card) => card.id !== deletedId
          );
          deck.totalCards = deck.flashcards.length;
        });
      })
      .addCase(deleteFlashcardAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete flashcard";
      });
  },
});

export const {
  startStudySession,
  endStudySession,
  setCurrentCardIndex,
  rateCard,
  shuffleFlashcards,
  clearError,
  setDecks,
  setLoading,
  setError,
} = flashcardSlice.actions;

export default flashcardSlice.reducer;
