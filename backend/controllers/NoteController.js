const Note = require('../models/Note');
const Flashcard = require('../models/Flashcard');

class NoteController {
  static async createNote(req, res) {
    try {
      const { title, content, category, tags } = req.body;
      const userId = req.user.id;

      const note = await Note.create({
        userId,
        title,
        content,
        category,
        tags
      });

      res.status(201).json({
        status: 'success',
        data: {
          note: {
            id: note.id,
            title: note.title,
            content: note.content,
            category: note.category,
            tags: note.tags,
            createdAt: note.createdAt
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

  static async getNotes(req, res) {
    try {
      const userId = req.user.id;
      const notes = await Note.findByUserId(userId);

      res.status(200).json({
        status: 'success',
        data: {
          notes: notes.map(note => ({
            id: note.id,
            title: note.title,
            content: note.content,
            category: note.category,
            tags: note.tags,
            createdAt: note.createdAt
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

  static async getNote(req, res) {
    try {
      const { id } = req.params;
      const note = await Note.findById(id);

      if (!note) {
        return res.status(404).json({
          status: 'error',
          message: 'Note not found'
        });
      }

      // Check if user owns the note
      if (note.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to access this note'
        });
      }

      res.status(200).json({
        status: 'success',
        data: {
          note: {
            id: note.id,
            title: note.title,
            content: note.content,
            category: note.category,
            tags: note.tags,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
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

  static async updateNote(req, res) {
    try {
      const { id } = req.params;
      const { title, content, category, tags } = req.body;

      const note = await Note.findById(id);
      if (!note) {
        return res.status(404).json({
          status: 'error',
          message: 'Note not found'
        });
      }

      // Check if user owns the note
      if (note.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update this note'
        });
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (category) updateData.category = category;
      if (tags) updateData.tags = tags;

      await Note.update(id, updateData);

      res.status(200).json({
        status: 'success',
        message: 'Note updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async deleteNote(req, res) {
    try {
      const { id } = req.params;

      const note = await Note.findById(id);
      if (!note) {
        return res.status(404).json({
          status: 'error',
          message: 'Note not found'
        });
      }

      // Check if user owns the note
      if (note.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to delete this note'
        });
      }

      // Delete associated flashcards
      const flashcards = await Flashcard.findByNoteId(id);
      for (const flashcard of flashcards) {
        await Flashcard.delete(flashcard.id);
      }

      // Delete the note
      await Note.delete(id);

      res.status(200).json({
        status: 'success',
        message: 'Note and associated flashcards deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  static async searchNotes(req, res) {
    try {
      const { query, category, tags } = req.query;
      const userId = req.user.id;

      let notes;
      if (tags) {
        notes = await Note.searchByTags(userId, tags.split(','));
      } else if (category) {
        notes = await Note.searchByCategory(userId, category);
      } else {
        notes = await Note.findByUserId(userId);
      }

      // Filter by search query if provided
      if (query) {
        const searchQuery = query.toLowerCase();
        notes = notes.filter(note => 
          note.title.toLowerCase().includes(searchQuery) ||
          note.content.toLowerCase().includes(searchQuery)
        );
      }

      res.status(200).json({
        status: 'success',
        data: {
          notes: notes.map(note => ({
            id: note.id,
            title: note.title,
            content: note.content,
            category: note.category,
            tags: note.tags,
            createdAt: note.createdAt
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
}

module.exports = NoteController; 