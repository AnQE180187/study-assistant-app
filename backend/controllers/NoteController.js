const prisma = require('../config/prismaClient');

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const userId = req.user.id;
    const note = await prisma.note.create({
      data: { title, content, category, userId },
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all notes for a user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get a single note
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res) => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
      include: { flashcards: true },
    });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    const updatedNote = await prisma.note.update({
      where: { id: req.params.id },
      data: { title, content, category },
    });
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    await prisma.note.delete({ where: { id: req.params.id } });
    res.json({ message: 'Note removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote }; 