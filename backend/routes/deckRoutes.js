const express = require('express');
const router = express.Router();
const {
  createDeck,
  getDecks,
  getDeckById,
  updateDeck,
  deleteDeck,
  getPublicDecks
} = require('../controllers/deckController');
const { protect } = require('../middlewares/authMiddleware');

// Public decks
router.route('/public').get(getPublicDecks);

// Các route dưới đây cần đăng nhập
router.use(protect);

router.route('/')
  .post(createDeck)
  .get(getDecks);

router.route('/:id')
  .get(getDeckById)
  .put(updateDeck)
  .delete(deleteDeck);

module.exports = router; 