const prisma = require("../config/prismaClient");

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const { title, content, planId, priority = "medium", tags = [] } = req.body;
    const userId = req.user.id;

    const note = await prisma.note.create({
      data: {
        title,
        content,
        planId: planId || null,
        priority,
        tags,
        userId,
      },
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all notes for a user with filtering and auto-create session notes
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;

    // Auto-create session notes for today if they don't exist
    await createTodaySessionNotes(userId);

    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
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
    });
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.userId !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all notes (admin only)
// @route   GET /api/notes/all
// @access  Private/Admin
const getAllNotesAdmin = async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        plan: true,
        user: { select: { name: true, email: true } },
      },
    });

    res.json(notes);
  } catch (error) {
    console.error("Error in getAllNotesAdmin:", error);
    res.status(500).json({ message: error.message });
  }
};

// Sửa updateNote để cho phép admin update mọi note
const updateNote = async (req, res) => {
  try {
    const { title, content, planId, priority, tags } = req.body;
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.userId !== req.user.id && req.user.role !== "admin")
      return res.status(401).json({ message: "Not authorized" });

    const updateData = { title, content, planId: planId || null };
    if (priority !== undefined) updateData.priority = priority;
    if (tags !== undefined) updateData.tags = tags;

    const updatedNote = await prisma.note.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Sửa deleteNote để cho phép admin xóa mọi note
const deleteNote = async (req, res) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.userId !== req.user.id && req.user.role !== "admin")
      return res.status(401).json({ message: "Not authorized" });
    await prisma.note.delete({ where: { id: req.params.id } });
    res.json({ message: "Note removed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle pin status
// @route   PATCH /api/notes/:id/toggle-pin
// @access  Private
const togglePin = async (req, res) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.userId !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    const updatedNote = await prisma.note.update({
      where: { id: req.params.id },
      data: { isPinned: !note.isPinned },
    });
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get note statistics
// @route   GET /api/notes/stats
// @access  Private
const getNoteStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalNotes = await prisma.note.count({ where: { userId } });
    const pinnedNotes = await prisma.note.count({
      where: { userId, isPinned: true },
    });
    const publicNotes = await prisma.note.count({
      where: { userId, isPublic: true },
    });

    // Get notes by priority
    const priorityStats = await prisma.note.groupBy({
      by: ["priority"],
      where: { userId },
      _count: { priority: true },
    });

    // Get notes by category
    const categoryStats = await prisma.note.groupBy({
      by: ["category"],
      where: { userId },
      _count: { category: true },
    });

    // Get recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivity = await prisma.note.count({
      where: { userId, createdAt: { gte: weekAgo } },
    });

    res.json({
      totalNotes,
      pinnedNotes,
      publicNotes,
      priorityStats,
      categoryStats,
      recentActivity,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all public notes
// @route   GET /api/notes/public
// @access  Public
const getPublicNotes = async (req, res) => {
  try {
    const {
      search,
      tags,
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const where = { isPublic: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: Array.isArray(tags) ? tags : [tags] };
    }

    if (category) {
      where.category = category;
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: { name: true },
        },
      },
    });
    res.json(notes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Bulk delete notes
// @route   DELETE /api/notes/bulk
// @access  Private
const bulkDeleteNotes = async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Note IDs array is required" });
    }

    // Verify all notes belong to user
    const notes = await prisma.note.findMany({
      where: { id: { in: ids } },
      select: { id: true, userId: true },
    });

    const unauthorizedNotes = notes.filter((note) => note.userId !== userId);
    if (unauthorizedNotes.length > 0) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete some notes" });
    }

    await prisma.note.deleteMany({
      where: { id: { in: ids } },
    });

    res.json({ message: `${ids.length} notes deleted` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all categories for a user
// @route   GET /api/notes/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    // Lấy tất cả category của user
    const notes = await prisma.note.findMany({
      where: { userId },
      select: { category: true },
    });
    // Lọc unique category
    const categorySet = new Set(notes.map((n) => n.category));
    const categoryList = Array.from(categorySet).sort();
    res.json(categoryList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Helper function to auto-create session notes for today
const createTodaySessionNotes = async (userId) => {
  try {
    // Get today's study plans for this user
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD format

    const todayPlans = await prisma.studyPlan.findMany({
      where: {
        userId,
        date: {
          gte: new Date(todayStr + "T00:00:00.000Z"),
          lt: new Date(todayStr + "T23:59:59.999Z"),
        },
      },
    });

    // For each plan, check if a session note exists, if not create one
    for (const plan of todayPlans) {
      const existingNote = await prisma.note.findFirst({
        where: {
          userId,
          planId: plan.id,
          title: {
            contains: `Session - ${plan.subject}`,
          },
        },
      });

      if (!existingNote) {
        await prisma.note.create({
          data: {
            title: `Session - ${plan.subject} (${todayStr})`,
            content: `Ghi chú cho buổi học ${
              plan.subject
            } ngày ${todayStr}\n\nThời gian: ${plan.startTime || plan.time} - ${
              plan.endTime || "N/A"
            }\nMô tả: ${
              plan.description || "Không có mô tả"
            }\n\n--- Ghi chú của bạn ---\n`,
            planId: plan.id,
            userId,
            category: "session",
          },
        });
      }
    }
  } catch (error) {
    console.error("Error creating today session notes:", error);
  }
};

// @desc    Get tag suggestions based on user's existing tags
// @route   GET /api/notes/tags/suggestions
// @access  Private
const getTagSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all unique tags from user's notes
    const notes = await prisma.note.findMany({
      where: { userId },
      select: { tags: true },
    });

    // Extract and count unique tags
    const tagCounts = {};
    notes.forEach((note) => {
      note.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort by frequency and return top suggestions
    const suggestions = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag]) => tag);

    // Add default suggestions if user has few tags
    const defaultTags = [
      "Important",
      "Urgent",
      "To Do",
      "Idea",
      "Reminder",
      "Study",
      "Work",
      "Personal",
      "Meeting",
      "Project",
    ];

    const allSuggestions = [...new Set([...suggestions, ...defaultTags])];

    res.json(allSuggestions.slice(0, 20));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
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
  getAllNotesAdmin,
  getTagSuggestions,
};
