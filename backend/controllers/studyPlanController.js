const prisma = require('../config/prismaClient');

// @desc    Create a new study plan
// @route   POST /api/studyplans
// @access  Private
const createStudyPlan = async (req, res) => {
  try {
    const { goal, startDate, endDate } = req.body;
    const userId = req.user.id;
    const plan = await prisma.studyPlan.create({
      data: { goal, startDate: new Date(startDate), endDate: new Date(endDate), userId },
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
    const plans = await prisma.studyPlan.findMany({
      where: { userId },
      orderBy: { startDate: 'asc' },
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
    const { goal, startDate, endDate } = req.body;
    const plan = await prisma.studyPlan.findUnique({ where: { id: req.params.id } });
    if (!plan) return res.status(404).json({ message: 'Study plan not found' });
    if (plan.userId !== req.user.id) return res.status(401).json({ message: 'Not authorized' });
    const updatedPlan = await prisma.studyPlan.update({
      where: { id: req.params.id },
      data: { goal, startDate: new Date(startDate), endDate: new Date(endDate) },
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

// @desc    Get next upcoming study plan for user
// @route   GET /api/studyplans/next/upcoming
// @access  Private
const getNextStudyPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const plan = await prisma.studyPlan.findFirst({
      where: {
        userId,
        startDate: { gte: now },
      },
      orderBy: { startDate: 'asc' },
    });
    res.json(plan);
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
  getNextStudyPlan,
}; 