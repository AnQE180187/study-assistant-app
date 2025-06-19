import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import flashcardReducer from './flashcardSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    flashcards: flashcardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store; 