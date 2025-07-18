const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const { getAllFaqs, getFaqById, createFaq, updateFaq, deleteFaq, getFaqCategories, getFaqsByCategory } = require("../../controllers/faqController");
const router = express.Router();

router.get("/", getAllFaqs);
router.get("/categories", protect, getFaqCategories);
router.get("/category/:category", protect, getFaqsByCategory);
router.get("/:id", protect, getFaqById);
router.post("/", protect, createFaq);
router.put("/:id", protect, updateFaq);
router.delete("/:id", protect, deleteFaq);

module.exports = router; 