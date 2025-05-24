const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");
const { 
  getAllPromotions,
  getPromotionById, 
  createPromotion, 
  updatePromotion 
} = require("../controllers/promotionController");

const router = express.Router();

router.get("/", paginationMiddleware("promotion", ["isShowInHome"]));
router.get("/all", getAllPromotions);
router.get("/:id", getPromotionById);
router.post("/", upload.single("image"), protect, createPromotion);
router.put("/:id", upload.single("image"), protect, updatePromotion);
router.delete("/:id", protect, deleteRecordMiddleware("promotion"));

module.exports = router;
