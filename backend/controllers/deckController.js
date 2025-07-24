const prisma = require("../config/prismaClient");

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
      include: {
        _count: {
          select: { flashcards: true },
        },
      },
      orderBy: { createdAt: "desc" },
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
    if (!deck) return res.status(404).json({ message: "Deck not found" });
    if (deck.userId !== req.user.id && !deck.isPublic) {
      return res
        .status(401)
        .json({ message: "Not authorized to view this deck" });
    }
    res.json(deck);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all decks (admin only)
// @route   GET /api/decks/all
// @access  Private/Admin
const getAllDecksAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized as admin" });
    }
    const decks = await prisma.deck.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: { flashcards: true },
        },
      },
    });
    res.json(decks);
  } catch (error) {
    console.error("Error fetching all decks for admin:", error);
    res.status(500).json({ message: error.message });
  }
};

// Sửa updateDeck để cho phép admin update mọi deck
const updateDeck = async (req, res) => {
  try {
    const { title, description, tags, isPublic } = req.body;
    const deck = await prisma.deck.findUnique({ where: { id: req.params.id } });
    if (!deck) return res.status(404).json({ message: "Deck not found" });
    if (deck.userId !== req.user.id && req.user.role !== "admin")
      return res.status(401).json({ message: "Not authorized" });
    const updatedDeck = await prisma.deck.update({
      where: { id: req.params.id },
      data: { title, description, tags, isPublic },
    });
    res.json(updatedDeck);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Sửa deleteDeck để cho phép admin xóa mọi deck
const deleteDeck = async (req, res) => {
  try {
    const deck = await prisma.deck.findUnique({
      where: { id: req.params.id },
      include: { flashcards: true },
    });
    if (!deck) return res.status(404).json({ message: "Deck not found" });
    if (deck.userId !== req.user.id && req.user.role !== "admin")
      return res.status(401).json({ message: "Not authorized" });
    await prisma.flashcard.deleteMany({ where: { deckId: deck.id } });
    await prisma.deck.delete({ where: { id: req.params.id } });
    res.json({ message: "Deck and its flashcards removed" });
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
      include: {
        _count: {
          select: { flashcards: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(decks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createDeck,
  getDecks,
  getPublicDecks,
  getDeckById,
  getAllDecksAdmin,
  updateDeck,
  deleteDeck,
};
