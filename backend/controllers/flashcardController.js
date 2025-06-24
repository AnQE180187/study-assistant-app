const prisma = require('../config/prismaClient');

// @desc    Create a new flashcard
// @route   POST /api/flashcards
// @access  Private
const createFlashcard = async (req, res) => {
  try {
    const { question, answer, noteId, isPublic } = req.body;
    const userId = req.user.id;
    const flashcard = await prisma.flashcard.create({
      data: { question, answer, noteId, userId, isPublic: !!isPublic },
    });
    res.status(201).json(flashcard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all flashcards for a user
// @route   GET /api/flashcards
// @access  Private
const getFlashcards = async (req, res) => {
  try {
    const userId = req.user.id;
    const flashcards = await prisma.flashcard.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(flashcards);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get a single flashcard
// @route   GET /api/flashcards/:id
// @access  Private
const getFlashcardById = async (req, res) => {
  try {
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: req.params.id },
    });
    if (!flashcard) return res.status(404).json({ message: 'Flashcard not found' });
    if (flashcard.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    res.json(flashcard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a flashcard
// @route   PUT /api/flashcards/:id
// @access  Private
const updateFlashcard = async (req, res) => {
  try {
    const { question, answer, isPublic } = req.body;
    const flashcard = await prisma.flashcard.findUnique({ where: { id: req.params.id } });
    if (!flashcard) return res.status(404).json({ message: 'Flashcard not found' });
    if (flashcard.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: req.params.id },
      data: { question, answer, isPublic },
    });
    res.json(updatedFlashcard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a flashcard
// @route   DELETE /api/flashcards/:id
// @access  Private
const deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await prisma.flashcard.findUnique({ where: { id: req.params.id } });
    if (!flashcard) return res.status(404).json({ message: 'Flashcard not found' });
    if (flashcard.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    await prisma.flashcard.delete({ where: { id: req.params.id } });
    res.json({ message: 'Flashcard removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle public/private
// @route   PATCH /api/flashcards/:id/toggle-public
// @access  Private
const toggleFlashcardPublic = async (req, res) => {
  try {
    const flashcard = await prisma.flashcard.findUnique({ where: { id: req.params.id } });
    if (!flashcard) return res.status(404).json({ message: 'Flashcard not found' });
    if (flashcard.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    const updated = await prisma.flashcard.update({
      where: { id: req.params.id },
      data: { isPublic: !flashcard.isPublic },
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all public flashcards
// @route   GET /api/flashcards/public/all
// @access  Public
const getPublicFlashcards = async (req, res) => {
  try {
    const flashcards = await prisma.flashcard.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(flashcards);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Search public flashcards
// @route   GET /api/flashcards/public/search?query=xxx
// @access  Public
const searchPublicFlashcards = async (req, res) => {
  try {
    const { query } = req.query;
    const flashcards = await prisma.flashcard.findMany({
      where: {
        isPublic: true,
        OR: [
          { question: { contains: query, mode: 'insensitive' } },
          { answer: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(flashcards);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createFlashcard,
  getFlashcards,
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
  toggleFlashcardPublic,
  getPublicFlashcards,
  searchPublicFlashcards,
}; 