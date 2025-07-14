const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");
const {
  getAllDiningCategories,
  getDiningCategoryById,
  createDiningCategory,
  updateDiningCategory,
  deleteDiningCategory,
} = require("../controllers/diningCategoryController");

const router = express.Router();

router.get("/", getAllDiningCategories);
router.get("/:id", getDiningCategoryById);
router.post("/", protect, upload.single('imagePath'), createDiningCategory);
router.put("/:id", protect, upload.single('imagePath'), updateDiningCategory);
router.delete("/:id", protect, deleteDiningCategory);

module.exports = router; 