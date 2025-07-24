const express = require("express");
const router = express.Router();
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getAllNotesAdmin,
  getTagSuggestions,
} = require("../controllers/noteController");
const { protect, admin } = require("../middlewares/authMiddleware");

router.use(protect);

router.route("/").post(createNote).get(getNotes);

router.route("/:id").get(getNoteById).put(updateNote).delete(deleteNote);

// Route cho admin lấy tất cả notes
router.get("/all", protect, admin, getAllNotesAdmin);

// Route cho tag suggestions
router.get("/tags/suggestions", getTagSuggestions);

module.exports = router;
