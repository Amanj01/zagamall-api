const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware");
const { getAllDiningCategories, getDiningCategoryById, createDiningCategory, updateDiningCategory, deleteDiningCategory } = require("../../controllers/diningCategoryController");
const router = express.Router();

router.get("/", getAllDiningCategories);
router.get("/:id", protect, getDiningCategoryById);
router.post("/", protect, upload.single('imagePath'), createDiningCategory);
router.put("/:id", protect, upload.single('imagePath'), updateDiningCategory);
router.delete("/:id", protect, deleteDiningCategory);

module.exports = router; 