const express = require("express");
const upload = require("../middlewares/uploadMiddleware");

const {
  createComment,
  updateComment,
  deleteComment,
  getCommentById,
} = require("../controllers/commentController");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  paginationMiddleware("comment", [], {
    include: { brand: true },
  })
);
router.get("/:brandId/comments", paginationMiddleware("comment", ["brandId"]));

router.get("/:commentId", protect, getCommentById);

router.post("/", upload.none(), protect, createComment);

router.put("/:commentId", upload.none(), protect, updateComment);

router.delete("/:commentId", protect, deleteComment);

module.exports = router;
