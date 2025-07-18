const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware");
const { getAllPromotions, getPromotionById, createPromotion, updatePromotion, deletePromotion } = require("../../controllers/promotionController");
const router = express.Router();

router.get("/", getAllPromotions);
router.get("/:id", protect, getPromotionById);
router.post("/", protect, createPromotion);
router.put("/:id", protect, updatePromotion);
router.delete("/:id", protect, deletePromotion);

module.exports = router; 