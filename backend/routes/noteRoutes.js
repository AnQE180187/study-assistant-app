const express = require('express');
const router = express.Router();
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  togglePin,
  getNoteStats,
  getPublicNotes,
  bulkDeleteNotes,
  getCategories,
} = require('../controllers/noteController');
const { protect } = require('../middlewares/authMiddleware');

// Public route - không cần authentication
router.get('/public', getPublicNotes);

// Protected routes
router.use(protect);

router.route('/')
  .post(createNote)
  .get(getNotes);

router.route('/stats')
  .get(getNoteStats);

router.route('/bulk')
  .delete(bulkDeleteNotes);

// Get all categories
router.get('/categories', getCategories);

router.route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

router.route('/:id/toggle-pin')
  .patch(togglePin);

module.exports = router; 