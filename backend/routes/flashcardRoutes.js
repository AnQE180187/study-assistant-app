const express = require('express');
const router = express.Router();
const {
  createFlashcard,
  getFlashcardsByDeck,
  getPublicFlashcardsByDeck,
  updateFlashcard,
  deleteFlashcard,
  getFlashcardById,
  searchFlashcards,
  getFlashcardStats,
  bulkDeleteFlashcards,
  bulkUpdateFlashcards,
  exportFlashcards,
  importFlashcards,
  generateAndSaveFlashcards,
  getFlashcardsByDeckForAdmin
} = require('../controllers/flashcardController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Public route - không cần authentication
router.get('/decks/:deckId/flashcards/public', getPublicFlashcardsByDeck);

router.use(protect);

// CRUD flashcard theo deck
router.route('/decks/:deckId/flashcards')
  .post(createFlashcard)
  .get(getFlashcardsByDeck);

router.route('/flashcards/:id')
  .get(getFlashcardById)
  .put(updateFlashcard)
  .delete(deleteFlashcard);

// Search flashcards
router.get('/flashcards/search', searchFlashcards);

// Flashcard statistics
router.get('/flashcards/stats', getFlashcardStats);

// Bulk operations
router.delete('/flashcards/bulk', bulkDeleteFlashcards);
router.put('/flashcards/bulk', bulkUpdateFlashcards);

// Export/Import
router.get('/flashcards/export', exportFlashcards);
router.post('/flashcards/import', importFlashcards);

// Route AI Gemini flashcard generation
router.post('/ai/generate-flashcards', protect, generateAndSaveFlashcards);

// Admin routes
router.get('/admin/decks/:deckId/flashcards', protect, admin, getFlashcardsByDeckForAdmin);

module.exports = router; 