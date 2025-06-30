const prisma = require('../config/prismaClient');

// @desc    Create a new study plan
// @route   POST /api/studyplans
// @access  Private
const createStudyPlan = async (req, res) => {
  try {
    const { title, date, time, note } = req.body;
    const userId = req.user.id;
    const plan = await prisma.studyPlan.create({
      data: { 
        title, 
        date: new Date(date), 
        time, 
        note: note || '',
        userId 
      },
    });
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all study plans for a user
// @route   GET /api/studyplans
// @access  Private
const getStudyPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;
    
    let whereClause = { userId };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
    
    const plans = await prisma.studyPlan.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });
    res.json(plans);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get a single study plan
// @route   GET /api/studyplans/:id
// @access  Private
const getStudyPlanById = async (req, res) => {
  try {
    const plan = await prisma.studyPlan.findUnique({ where: { id: req.params.id } });
    if (!plan) return res.status(404).json({ message: 'Study plan not found' });
    if (plan.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a study plan
// @route   PUT /api/studyplans/:id
// @access  Private
const updateStudyPlan = async (req, res) => {
  try {
    const { title, date, time, note, completed } = req.body;
    const plan = await prisma.studyPlan.findUnique({ where: { id: req.params.id } });
    if (!plan) return res.status(404).json({ message: 'Study plan not found' });
    if (plan.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    const updatedPlan = await prisma.studyPlan.update({
      where: { id: req.params.id },
      data: { 
        title, 
        date: new Date(date), 
        time, 
        note: note || '',
        completed: completed !== undefined ? completed : plan.completed
      },
    });
    res.json(updatedPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a study plan
// @route   DELETE /api/studyplans/:id
// @access  Private
const deleteStudyPlan = async (req, res) => {
  try {
    const plan = await prisma.studyPlan.findUnique({ where: { id: req.params.id } });
    if (!plan) return res.status(404).json({ message: 'Study plan not found' });
    if (plan.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    await prisma.studyPlan.delete({ where: { id: req.params.id } });
    res.json({ message: 'Study plan removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get study plans by date range
// @route   GET /api/studyplans/range
// @access  Private
const getStudyPlansByRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    
    const plans = await prisma.studyPlan.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: 'asc' },
    });
    res.json(plans);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle study plan completion
// @route   PATCH /api/studyplans/:id/toggle
// @access  Private
const toggleStudyPlanCompletion = async (req, res) => {
  try {
    const plan = await prisma.studyPlan.findUnique({ where: { id: req.params.id } });
    if (!plan) return res.status(404).json({ message: 'Study plan not found' });
    if (plan.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    
    const updatedPlan = await prisma.studyPlan.update({
      where: { id: req.params.id },
      data: { completed: !plan.completed },
    });
    res.json(updatedPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get study plan statistics
// @route   GET /api/studyplans/stats
// @access  Private
const getStudyPlanStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    const whereClause = { userId };
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    
    const totalPlans = await prisma.studyPlan.count({ where: whereClause });
    const completedPlans = await prisma.studyPlan.count({ 
      where: { ...whereClause, completed: true } 
    });
    const upcomingPlans = await prisma.studyPlan.count({
      where: { 
        ...whereClause, 
        date: { gte: new Date() },
        completed: false 
      }
    });
    
    res.json({
      total: totalPlans,
      completed: completedPlans,
      upcoming: upcomingPlans,
      completionRate: totalPlans > 0 ? (completedPlans / totalPlans) * 100 : 0,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createStudyPlan,
  getStudyPlans,
  getStudyPlanById,
  updateStudyPlan,
  deleteStudyPlan,
  getStudyPlansByRange,
  toggleStudyPlanCompletion,
  getStudyPlanStats,
}; 