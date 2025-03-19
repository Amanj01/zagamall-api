const express = require("express");
const upload = require("../middlewares/uploadMiddleware");

const {
  createComment,
  updateComment,
  getCommentById,
} = require("../controllers/commentController");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");

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

router.post("/", upload.single("cardImage"), protect, createComment);

router.put("/:commentId", upload.single("cardImage"), protect, updateComment);

router.delete("/:id", protect, deleteRecordMiddleware("comment"));

module.exports = router;
