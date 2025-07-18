const express = require("express");
const { getAllFAQCategories, getFAQCategoryById, getNextOrderNumber } = require("../../controllers/faqCategoryController");
const router = express.Router();

router.get("/", getAllFAQCategories);
router.get("/all", getAllFAQCategories);
router.get("/next-order", getNextOrderNumber);
router.get("/:id", getFAQCategoryById);

module.exports = router; 