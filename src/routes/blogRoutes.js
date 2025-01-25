const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const {
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  deleteBlogImage,
} = require("../controllers/blogController");
const paginationMiddleware = require("../middlewares/paginationMiddleware");

const router = express.Router();

router.get("/", paginationMiddleware("blog"));

router.get("/:id", getBlogById);

router.post("/", upload.array("gallery", 10), protect, createBlog);
router.put("/:id", upload.array("gallery", 10), protect, updateBlog);

router.delete("/:id", deleteBlog);

router.delete("/:id/gallery/:imageId", protect, deleteBlogImage);

module.exports = router;
