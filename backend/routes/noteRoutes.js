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

// Route cho admin lấy tất cả notes (phải đặt trước /:id)
router.get("/all", admin, getAllNotesAdmin);

// Route cho tag suggestions
router.get("/tags/suggestions", getTagSuggestions);

router.route("/").post(createNote).get(getNotes);

router.route("/:id").get(getNoteById).put(updateNote).delete(deleteNote);

module.exports = router;
