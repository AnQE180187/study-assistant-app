import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  decks: [],
  loading: false,
  error: null,
};

const flashcardSlice = createSlice({
  name: 'flashcards',
  initialState,
  reducers: {
    setDecks(state, action) {
      state.decks = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setDecks, setLoading, setError } = flashcardSlice.actions;
export default flashcardSlice.reducer; 