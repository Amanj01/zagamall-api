const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");
const { 
  getAllFAQCategories,
  getFAQCategoryById, 
  createFAQCategory, 
  updateFAQCategory,
  getNextOrderNumber
} = require("../controllers/faqCategoryController");

const router = express.Router();

router.get("/", getAllFAQCategories);
router.get("/all", getAllFAQCategories);
router.get("/next-order", getNextOrderNumber);
router.get("/:id", getFAQCategoryById);
router.post("/", protect, createFAQCategory);
router.put("/:id", protect, updateFAQCategory);
router.delete("/:id", protect, deleteRecordMiddleware("FAQCategory"));

module.exports = router; 