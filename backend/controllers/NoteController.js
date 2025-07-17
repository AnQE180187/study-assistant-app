const prisma = require('../config/prismaClient');

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      planId 
    } = req.body;
    const userId = req.user.id;
    
    const note = await prisma.note.create({
      data: { 
        title, 
        content, 
        planId: planId || null,
        userId 
      },
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all notes for a user with filtering
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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
    const { 
      title, 
      content, 
      planId 
    } = req.body;
    
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    
    const updatedNote = await prisma.note.update({
      where: { id: req.params.id },
      data: { 
        title, 
        content, 
        planId: planId || null
      },
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

// @desc    Toggle pin status
// @route   PATCH /api/notes/:id/toggle-pin
// @access  Private
const togglePin = async (req, res) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    
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
    const pinnedNotes = await prisma.note.count({ where: { userId, isPinned: true } });
    const publicNotes = await prisma.note.count({ where: { userId, isPublic: true } });
    
    // Get notes by priority
    const priorityStats = await prisma.note.groupBy({
      by: ['priority'],
      where: { userId },
      _count: { priority: true },
    });
    
    // Get notes by category
    const categoryStats = await prisma.note.groupBy({
      by: ['category'],
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
    const { search, tags, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const where = { isPublic: true };
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
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
          select: { name: true }
        }
      }
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
      return res.status(400).json({ message: 'Note IDs array is required' });
    }

    // Verify all notes belong to user
    const notes = await prisma.note.findMany({
      where: { id: { in: ids } },
      select: { id: true, userId: true },
    });

    const unauthorizedNotes = notes.filter(note => note.userId !== userId);
    if (unauthorizedNotes.length > 0) {
      return res.status(401).json({ message: 'Not authorized to delete some notes' });
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
      select: { category: true }
    });
    // Lọc unique category
    const categorySet = new Set(notes.map(n => n.category));
    const categoryList = Array.from(categorySet).sort();
    res.json(categoryList);
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
  getCategories 
}; 