const express = require('express');
const router = express.Router();
const { getAiLogs, deleteAiLog } = require('../controllers/aiLogController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.use(protect, admin);

router.get('/logs', getAiLogs);
router.delete('/logs/:id', deleteAiLog);

module.exports = router; 