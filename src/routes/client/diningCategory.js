const express = require("express");
const { getAllDiningCategories, getDiningCategoryById } = require("../../controllers/diningCategoryController");
const router = express.Router();

router.get("/", getAllDiningCategories);
router.get("/:id", getDiningCategoryById);

module.exports = router; 