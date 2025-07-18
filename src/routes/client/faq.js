const express = require("express");
const { getAllFaqs, getFaqById, getFaqCategories, getFaqsByCategory } = require("../../controllers/faqController");
const router = express.Router();

router.get("/", getAllFaqs);
router.get("/categories", getFaqCategories);
router.get("/category/:category", getFaqsByCategory);
router.get("/:id", getFaqById);

module.exports = router; 