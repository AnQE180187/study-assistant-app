const prisma = require("../config/prismaClient");
const {
  generateFlashcardsFromGemini,
  sendFlashcardsToInternalAPI,
} = require("../services/geminiAgent");
const { createAiLog } = require("./aiLogController");

// @desc    Create a new flashcard in a deck
// @route   POST /api/decks/:deckId/flashcards
// @access  Private
const createFlashcard = async (req, res) => {
  try {
    const { term, definition } = req.body;
    const { deckId } = req.params;
    const userId = req.user.id;

    // Kiểm tra deck có tồn tại và user có quyền tạo flashcard không
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: { userId: true },
    });

    if (!deck) {
      return res.status(404).json({ message: "Deck not found" });
    }

    if (deck.userId !== userId) {
      return res
        .status(401)
        .json({ message: "Not authorized to create flashcards in this deck" });
    }

    const flashcard = await prisma.flashcard.create({
      data: { term, definition, deckId, userId },
    });
    res.status(201).json(flashcard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all flashcards in a deck
// @route   GET /api/decks/:deckId/flashcards
// @access  Private
const getFlashcardsByDeck = async (req, res) => {
  try {
    const { deckId } = req.params;
    const userId = req.user.id;

    // Kiểm tra deck có tồn tại và user có quyền xem không
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: { userId: true, isPublic: true },
    });

    if (!deck) {
      return res.status(404).json({ message: "Deck not found" });
    }

    // Chỉ cho phép xem nếu là owner hoặc deck là public
    if (deck.userId !== userId && !deck.isPublic) {
      return res
        .status(401)
        .json({ message: "Not authorized to view this deck" });
    }

    // Nếu là owner, lấy tất cả flashcards trong deck
    // Nếu là public deck và không phải owner, chỉ lấy flashcards của owner
    const whereClause =
      deck.userId === userId ? { deckId } : { deckId, userId: deck.userId };

    const flashcards = await prisma.flashcard.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    res.json(flashcards);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getFlashcardsByDeckForAdmin = async (req, res) => {
  try {
    // Check admin role
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    const { deckId } = req.params;
    console.log(`Admin fetching flashcards for deck: ${deckId}`);

    // First check if deck exists
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: {
        id: true,
        name: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!deck) {
      console.log(`Deck not found: ${deckId}`);
      return res.status(404).json({ message: "Deck not found" });
    }

    const flashcards = await prisma.flashcard.findMany({
      where: { deckId },
      include: {
        deck: {
          select: {
            name: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Found ${flashcards.length} flashcards for deck ${deck.name}`);
    res.json(flashcards);
  } catch (error) {
    console.error("Error fetching flashcards for admin:", error);
    res.status(500).json({ message: error.message });
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
    if (!flashcard)
      return res.status(404).json({ message: "Flashcard not found" });
    if (flashcard.userId !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });
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
    const { term, definition } = req.body;
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: req.params.id },
    });
    if (!flashcard)
      return res.status(404).json({ message: "Flashcard not found" });
    if (flashcard.userId !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: req.params.id },
      data: { term, definition },
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
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: req.params.id },
    });
    if (!flashcard)
      return res.status(404).json({ message: "Flashcard not found" });
    if (flashcard.userId !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });
    await prisma.flashcard.delete({ where: { id: req.params.id } });
    res.json({ message: "Flashcard removed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Search flashcards
// @route   GET /api/flashcards/search?q=query
// @access  Private
const searchFlashcards = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const flashcards = await prisma.flashcard.findMany({
      where: {
        userId,
        OR: [
          { term: { contains: q, mode: "insensitive" } },
          { definition: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(flashcards);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get flashcard statistics
// @route   GET /api/flashcards/stats
// @access  Private
const getFlashcardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalCards = await prisma.flashcard.count({
      where: { userId },
    });

    const totalDecks = await prisma.deck.count({
      where: { userId },
    });

    // Get flashcards created in last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentActivity = await prisma.flashcard.count({
      where: {
        userId,
        createdAt: { gte: weekAgo },
      },
    });

    // Get categories count (based on deck tags)
    const decks = await prisma.deck.findMany({
      where: { userId },
      select: { tags: true },
    });

    const categoriesCount = {};
    decks.forEach((deck) => {
      deck.tags.forEach((tag) => {
        categoriesCount[tag] = (categoriesCount[tag] || 0) + 1;
      });
    });

    res.json({
      totalCards,
      totalDecks,
      categoriesCount,
      recentActivity,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Bulk delete flashcards
// @route   DELETE /api/flashcards/bulk
// @access  Private
const bulkDeleteFlashcards = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    if (!ids || !Array.isArray(ids)) {
      return res
        .status(400)
        .json({ message: "Flashcard IDs array is required" });
    }

    // Verify all flashcards belong to user
    const flashcards = await prisma.flashcard.findMany({
      where: { id: { in: ids } },
      select: { id: true, userId: true },
    });

    const unauthorizedCards = flashcards.filter(
      (card) => card.userId !== userId
    );
    if (unauthorizedCards.length > 0) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete some flashcards" });
    }

    await prisma.flashcard.deleteMany({
      where: { id: { in: ids } },
    });

    res.json({ message: `${ids.length} flashcards deleted` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Bulk update flashcards
// @route   PUT /api/flashcards/bulk
// @access  Private
const bulkUpdateFlashcards = async (req, res) => {
  try {
    const { updates } = req.body;
    const userId = req.user.id;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ message: "Updates array is required" });
    }

    const updatedFlashcards = [];

    for (const update of updates) {
      const { id, data } = update;

      // Verify flashcard belongs to user
      const flashcard = await prisma.flashcard.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!flashcard) {
        continue;
      }

      if (flashcard.userId !== userId) {
        continue;
      }

      const updated = await prisma.flashcard.update({
        where: { id },
        data: { term: data.term, definition: data.definition },
      });

      updatedFlashcards.push(updated);
    }

    res.json(updatedFlashcards);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Export flashcards
// @route   GET /api/flashcards/export?deckId=xxx
// @access  Private
const exportFlashcards = async (req, res) => {
  try {
    const { deckId } = req.query;
    const userId = req.user.id;

    const whereClause = { userId };
    if (deckId) {
      whereClause.deckId = deckId;
    }

    const flashcards = await prisma.flashcard.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    const exportData = JSON.stringify(flashcards, null, 2);
    res.json({ data: exportData, count: flashcards.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Import flashcards
// @route   POST /api/flashcards/import
// @access  Private
const importFlashcards = async (req, res) => {
  try {
    const { data, deckId } = req.body;
    const userId = req.user.id;

    if (!data || !deckId) {
      return res.status(400).json({ message: "Data and deckId are required" });
    }

    // Verify deck belongs to user
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: { userId: true },
    });

    if (!deck || deck.userId !== userId) {
      return res
        .status(401)
        .json({ message: "Not authorized to import to this deck" });
    }

    const importedData = JSON.parse(data);
    const importedFlashcards = [];

    for (const cardData of importedData) {
      const flashcard = await prisma.flashcard.create({
        data: {
          term: cardData.term,
          definition: cardData.definition,
          deckId,
          userId,
        },
      });
      importedFlashcards.push(flashcard);
    }

    res.json(importedFlashcards);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle public/private
// @route   PATCH /api/flashcards/:id/toggle-public
// @access  Private
const toggleFlashcardPublic = async (req, res) => {
  try {
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: req.params.id },
    });
    if (!flashcard)
      return res.status(404).json({ message: "Flashcard not found" });
    if (flashcard.userId !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });
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
      orderBy: { createdAt: "desc" },
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
          { term: { contains: query, mode: "insensitive" } },
          { definition: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(flashcards);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all flashcards in a public deck (for viewing)
// @route   GET /api/decks/:deckId/flashcards/public
// @access  Public
const getPublicFlashcardsByDeck = async (req, res) => {
  try {
    const { deckId } = req.params;

    // Kiểm tra deck có public không
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: { isPublic: true },
    });

    if (!deck) {
      return res.status(404).json({ message: "Deck not found" });
    }

    if (!deck.isPublic) {
      return res.status(403).json({ message: "This deck is not public" });
    }

    const flashcards = await prisma.flashcard.findMany({
      where: { deckId },
      orderBy: { createdAt: "asc" },
    });

    res.json(flashcards);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc   Sinh flashcard từ Gemini AI và lưu vào deck
 * @route  POST /api/ai/generate-flashcards
 * @access Private
 * @body   { keyword: string, deckId: string }
 */
async function generateAndSaveFlashcards(req, res) {
  try {
    const { keyword, deckId, count, language } = req.body;
    const userId = req.user.id;
    if (!keyword || !deckId)
      return res.status(400).json({ message: "keyword và deckId là bắt buộc" });
    // Kiểm tra quyền sở hữu deck
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: { userId: true },
    });
    if (!deck) return res.status(404).json({ message: "Deck not found" });
    if (deck.userId !== userId)
      return res.status(401).json({ message: "Not authorized" });
    // Lấy học vấn hiện tại của user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { education: true },
    });
    // Gọi Gemini
    let flashcards, geminiResponseText;
    try {
      const {
        generateFlashcardsFromGemini,
      } = require("../services/geminiAgent");
      flashcards = await generateFlashcardsFromGemini(
        keyword,
        count,
        language,
        user?.education
      );
      geminiResponseText = JSON.stringify(flashcards);
    } catch (geminiErr) {
      console.error("Gemini error:", geminiErr);
      return res
        .status(500)
        .json({ message: geminiErr.message || "Gemini AI error" });
    }
    // Lưu log AI
    try {
      await createAiLog(userId, keyword, geminiResponseText);
    } catch (logErr) {
      console.error("Lỗi lưu log AI:", logErr);
    }
    // Gửi từng flashcard vào API nội bộ
    let results;
    try {
      const {
        sendFlashcardsToInternalAPI,
      } = require("../services/geminiAgent");
      results = await sendFlashcardsToInternalAPI(
        flashcards,
        deckId,
        req.headers.authorization?.replace("Bearer ", "")
      );
    } catch (apiErr) {
      console.error("Internal API error:", apiErr);
      return res
        .status(500)
        .json({ message: "Internal API error: " + (apiErr.message || apiErr) });
    }
    res.json({ count: results.length, results });
  } catch (err) {
    console.error("generateAndSaveFlashcards error:", err);
    res.status(500).json({ message: err.message || "Unknown error" });
  }
}

module.exports = {
  createFlashcard,
  getFlashcardsByDeck,
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
  searchFlashcards,
  getFlashcardStats,
  bulkDeleteFlashcards,
  bulkUpdateFlashcards,
  exportFlashcards,
  importFlashcards,
  toggleFlashcardPublic,
  getPublicFlashcards,
  searchPublicFlashcards,
  getPublicFlashcardsByDeck,
  getFlashcardsByDeckForAdmin,
  generateAndSaveFlashcards,
};
