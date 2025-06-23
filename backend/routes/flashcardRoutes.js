const express = require('express');
const router = express.Router();
const {
  createFlashcard,
  getFlashcards,
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
  toggleFlashcardPublic,
  getPublicFlashcards,
  searchPublicFlashcards
} = require('../controllers/flashcardController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

// CRUD
router.route('/')
  .post(createFlashcard)
  .get(getFlashcards);

router.route('/:id')
  .get(getFlashcardById)
  .put(updateFlashcard)
  .delete(deleteFlashcard);

// Toggle public/private
router.route('/:id/toggle-public')
  .patch(toggleFlashcardPublic);

// Public flashcards (no auth required)
router.route('/public/all').get(getPublicFlashcards);
router.route('/public/search').get(searchPublicFlashcards);

module.exports = router; 