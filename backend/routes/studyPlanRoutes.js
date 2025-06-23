const express = require('express');
const router = express.Router();
const {
  createStudyPlan,
  getStudyPlans,
  getStudyPlanById,
  updateStudyPlan,
  deleteStudyPlan,
  getNextStudyPlan
} = require('../controllers/studyPlanController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

// CRUD
router.route('/')
  .post(createStudyPlan)
  .get(getStudyPlans);

router.route('/:id')
  .get(getStudyPlanById)
  .put(updateStudyPlan)
  .delete(deleteStudyPlan);

// Get next upcoming study plan
router.route('/next/upcoming').get(getNextStudyPlan);

module.exports = router; 