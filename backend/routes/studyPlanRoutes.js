const express = require('express');
const router = express.Router();
const {
  createStudyPlan,
  getStudyPlans,
  getStudyPlanById,
  updateStudyPlan,
  deleteStudyPlan,
  getStudyPlansByRange,
  toggleStudyPlanCompletion,
  getStudyPlanStats,
  getAllStudyPlansAdmin
} = require('../controllers/studyPlanController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.use(protect);

// CRUD
router.route('/')
  .post(createStudyPlan)
  .get(getStudyPlans);

router.route('/:id')
  .get(getStudyPlanById)
  .put(updateStudyPlan)
  .delete(deleteStudyPlan);

// Additional endpoints
router.route('/range').get(getStudyPlansByRange);
router.route('/stats').get(getStudyPlanStats);
router.route('/:id/toggle').patch(toggleStudyPlanCompletion);

// Route cho admin lấy tất cả study plans
router.get('/all', protect, admin, getAllStudyPlansAdmin);

module.exports = router; 