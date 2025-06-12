const express = require('express');
const router = express.Router();
const StudyPlanController = require('../controllers/StudyPlanController');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Create a new study plan
router.post('/', StudyPlanController.createStudyPlan);

// Get all study plans for the authenticated user
router.get('/', StudyPlanController.getStudyPlans);

// Get active study plans
router.get('/active', StudyPlanController.getActiveStudyPlans);

// Get a specific study plan
router.get('/:id', StudyPlanController.getStudyPlan);

// Update a study plan
router.put('/:id', StudyPlanController.updateStudyPlan);

// Delete a study plan
router.delete('/:id', StudyPlanController.deleteStudyPlan);

// Add a schedule item to a study plan
router.post('/:id/schedule', StudyPlanController.addScheduleItem);

// Update goal progress
router.put('/:id/goals/:goalId/progress', StudyPlanController.updateGoalProgress);

module.exports = router; 