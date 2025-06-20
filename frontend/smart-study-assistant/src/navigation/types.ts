import { Flashcard } from "../services/flashcardService";

export type RootStackParamList = {
  // Main tabs
  Home: undefined;
  Notes: undefined;
  Flashcards: undefined;
  Planner: undefined;
  Profile: undefined;
  // Flashcard screens
  FlashcardDeckDetail: {
    noteId: string;
    title: string;
  };
  FlashcardManagement: {
    noteId: string;
    title: string;
  };
  FlashcardPractice: {
    noteId: string;
    title: string;
    flashcards: Flashcard[];
  };
  CreateFlashcard: {
    noteId?: string;
    onCreated?: () => void;
  };
  EditFlashcard: {
    flashcard: Flashcard;
    onUpdate?: () => void;
  };

  // Note screens
  NotesSelection: undefined;
  NoteEditor: {
    noteId?: string;
  };

  // Auth screens
  Login: undefined;
  Register: undefined;
  Welcome: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
