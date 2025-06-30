import { Flashcard } from "../services/flashcardService";
import { StudyPlan } from "../services/studyPlanService";

export type RootStackParamList = {
  // Main tabs
  Home: undefined;
  Notes: undefined;
  Flashcards: undefined;
  Planner: undefined;
  Profile: undefined;
  // Flashcard screens
  FlashcardDeckDetail: {
    deckId: string;
    title: string;
  };
  FlashcardManagement: {
    deckId: string;
    title: string;
  };
  FlashcardPractice: {
    deckId: string;
    title: string;
    flashcards?: Flashcard[];
    isPublic?: boolean;
  };
  CreateFlashcard: {
    deckId?: string;
    onCreated?: () => void;
  };
  EditFlashcard: {
    flashcard: Flashcard;
    onUpdate?: () => void;
  };

  // Study Plan screens
  StudyPlanDetail: {
    studyPlanId: string;
  };
  CreateStudyPlan: {
    date?: string;
    onCreated?: () => void;
  };
  EditStudyPlan: {
    studyPlan: StudyPlan;
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
