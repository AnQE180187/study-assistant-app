const Flashcard = require('../models/Flashcard');
const Note = require('../models/Note');

class FlashcardController {
  static async createFlashcard(req, res) {
    try {
      const { noteId, question, answer, difficulty } = req.body;
      const userId = req.user.id;

      // Check if note exists and belongs to user
      const note = await Note.findById(noteId);
      if (!note) {
        return res.status(404).json({
          status: 'error',
          message: 'Note not found'
        });
      }

      if (note.userId !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to create flashcards for this note'
        });
      }

      const flashcard = await Flashcard.create({
        noteId,
        userId,
        question,
        answer,
        difficulty
      });

      res.status(201).json({
        status: 'success',
        data: {
          flashcard: {
            id: flashcard.id,
            noteId: flashcard.noteId,
            question: flashcard.question,
            answer: flashcard.answer,
            difficulty: flashcard.difficulty,
            createdAt: flashcard.createdAt
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async getFlashcards(req, res) {
    try {
      const userId = req.user.id;
      const flashcards = await Flashcard.findByUserId(userId);

      res.status(200).json({
        status: 'success',
        data: {
          flashcards: flashcards.map(flashcard => ({
            id: flashcard.id,
            noteId: flashcard.noteId,
            question: flashcard.question,
            answer: flashcard.answer,
            difficulty: flashcard.difficulty,
            lastReviewed: flashcard.lastReviewed,
            nextReview: flashcard.nextReview,
            createdAt: flashcard.createdAt
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async getFlashcard(req, res) {
    try {
      const { id } = req.params;
      const flashcard = await Flashcard.findById(id);

      if (!flashcard) {
        return res.status(404).json({
          status: 'error',
          message: 'Flashcard not found'
        });
      }

      // Check if user owns the flashcard
      if (flashcard.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to access this flashcard'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          flashcard: {
            id: flashcard.id,
            noteId: flashcard.noteId,
            question: flashcard.question,
            answer: flashcard.answer,
            difficulty: flashcard.difficulty,
            lastReviewed: flashcard.lastReviewed,
            nextReview: flashcard.nextReview,
            createdAt: flashcard.createdAt,
            updatedAt: flashcard.updatedAt
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async updateFlashcard(req, res) {
    try {
      const { id } = req.params;
      const { question, answer, difficulty } = req.body;

      const flashcard = await Flashcard.findById(id);
      if (!flashcard) {
        return res.status(404).json({
          status: 'error',
          message: 'Flashcard not found'
        });
      }

      // Check if user owns the flashcard
      if (flashcard.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update this flashcard'
        });
      }

      const updateData = {};
      if (question) updateData.question = question;
      if (answer) updateData.answer = answer;
      if (difficulty) updateData.difficulty = difficulty;

      await Flashcard.update(id, updateData);

      res.status(200).json({
        status: 'success',
        message: 'Flashcard updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async deleteFlashcard(req, res) {
    try {
      const { id } = req.params;

      const flashcard = await Flashcard.findById(id);
      if (!flashcard) {
        return res.status(404).json({
          status: 'error',
          message: 'Flashcard not found'
        });
      }

      // Check if user owns the flashcard
      if (flashcard.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to delete this flashcard'
        });
      }

      await Flashcard.delete(id);

      res.status(200).json({
        status: 'success',
        message: 'Flashcard deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async getDueFlashcards(req, res) {
    try {
      const userId = req.user.id;
      const flashcards = await Flashcard.getDueCards(userId);

      res.status(200).json({
        status: 'success',
        data: {
          flashcards: flashcards.map(flashcard => ({
            id: flashcard.id,
            noteId: flashcard.noteId,
            question: flashcard.question,
            answer: flashcard.answer,
            difficulty: flashcard.difficulty,
            lastReviewed: flashcard.lastReviewed,
            nextReview: flashcard.nextReview
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async updateReviewStatus(req, res) {
    try {
      const { id } = req.params;
      const { difficulty } = req.body;

      const flashcard = await Flashcard.findById(id);
      if (!flashcard) {
        return res.status(404).json({
          status: 'error',
          message: 'Flashcard not found'
        });
      }

      // Check if user owns the flashcard
      if (flashcard.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update this flashcard'
        });
      }

      await Flashcard.updateReviewStatus(id, difficulty);

      res.status(200).json({
        status: 'success',
        message: 'Review status updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = FlashcardController; 