const express = require("express");
const { getAllPromotions, getPromotionById } = require("../../controllers/promotionController");
const router = express.Router();

router.get("/", getAllPromotions);
router.get("/:id", getPromotionById);

module.exports = router; 