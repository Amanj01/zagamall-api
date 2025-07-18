const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const deleteRecordMiddleware = require("../../middlewares/deleteMiddleware");
const { getAllCategories, getCategoryById, createCategory, updateCategory } = require("../../controllers/categoryController");
const router = express.Router();

router.get("/", getAllCategories);
router.get("/:id", protect, getCategoryById);
router.post("/", protect, createCategory);
router.put("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteRecordMiddleware("category"));

module.exports = router; 