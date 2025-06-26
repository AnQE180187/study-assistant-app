const express = require('express');
const router = express.Router();
const {
  createFlashcard,
  getFlashcardsByDeck,
  updateFlashcard,
  deleteFlashcard
} = require('../controllers/flashcardController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

// CRUD flashcard theo deck
router.route('/decks/:deckId/flashcards')
  .post(createFlashcard)
  .get(getFlashcardsByDeck);

router.route('/flashcards/:id')
  .put(updateFlashcard)
  .delete(deleteFlashcard);

module.exports = router; 