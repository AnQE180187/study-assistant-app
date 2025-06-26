const prisma = require('../config/prismaClient');

// @desc    Create a new deck
// @route   POST /api/decks
// @access  Private
const createDeck = async (req, res) => {
  try {
    const { title, description, tags, isPublic } = req.body;
    const userId = req.user.id;
    const deck = await prisma.deck.create({
      data: { title, description, tags, isPublic: !!isPublic, userId },
    });
    res.status(201).json(deck);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all decks for a user
// @route   GET /api            
// @access  Private
const getDecks = async (req, res) => {
  try {
    const userId = req.user.id;
    const decks = await prisma.deck.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(decks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get a single deck (with flashcards)
// @route   GET /api/decks/:id
// @access  Private
const getDeckById = async (req, res) => {
  try {
    const deck = await prisma.deck.findUnique({
      where: { id: req.params.id },
      include: { flashcards: true },
    });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });
    if (deck.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    res.json(deck);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a deck
// @route   PUT /api/decks/:id
// @access  Private
const updateDeck = async (req, res) => {
  try {
    const { title, description, tags, isPublic } = req.body;
    const deck = await prisma.deck.findUnique({ where: { id: req.params.id } });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });
    if (deck.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    const updatedDeck = await prisma.deck.update({
      where: { id: req.params.id },
      data: { title, description, tags, isPublic },
    });
    res.json(updatedDeck);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a deck (and its flashcards)
// @route   DELETE /api/decks/:id
// @access  Private
const deleteDeck = async (req, res) => {
  try {
    const deck = await prisma.deck.findUnique({ where: { id: req.params.id }, include: { flashcards: true } });
    if (!deck) return res.status(404).json({ message: 'Deck not found' });
    if (deck.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    // Xóa flashcards con
    await prisma.flashcard.deleteMany({ where: { deckId: deck.id } });
    await prisma.deck.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deck and its flashcards removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all public decks
// @route   GET /api/decks/public
// @access  Public
const getPublicDecks = async (req, res) => {
  try {
    const decks = await prisma.deck.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: { flashcards: true },
    });
    res.json(decks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createDeck,
  getDecks,
  getDeckById,
  updateDeck,
  deleteDeck,
  getPublicDecks,
}; 