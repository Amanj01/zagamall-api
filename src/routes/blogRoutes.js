const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const {
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlogImage,
} = require("../controllers/blogController");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deletemiddleware");

const router = express.Router();

router.get(
  "/",
  paginationMiddleware("blog", [], {
    include: { gallery: true },
  })
);

router.get("/:id", getBlogById);

router.post(
  "/",
  upload.fields([
    { name: "gallery", maxCount: 10 },
    { name: "coverImage", maxCount: 1 },
  ]),
  protect,
  createBlog
);
router.put(
  "/:id",
  upload.fields([
    { name: "gallery", maxCount: 10 },
    { name: "coverImage", maxCount: 1 },
  ]),
  protect,
  updateBlog
);

router.delete("/:id", protect, deleteRecordMiddleware("blog"));

router.delete("/:id/gallery/:imageId", protect, deleteBlogImage);

module.exports = router;
