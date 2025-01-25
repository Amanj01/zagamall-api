const express = require("express");
const upload = require("../middlewares/uploadMiddleware");

const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:brandId/comments", getComments);

router.post("/:brandId/comments", upload.none(), protect, createComment);

router.put(
  "/:brandId/comments/:commentId",
  upload.none(),
  protect,
  updateComment
);

router.delete("/:brandId/comments/:commentId", protect, deleteComment);

module.exports = router;
