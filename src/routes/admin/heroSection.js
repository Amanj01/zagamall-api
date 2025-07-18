const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const { getHeroSections, getHeroSectionById, createHeroSection, updateHeroSection, deleteHeroSection } = require("../../controllers/heroSectionController");
const router = express.Router();

router.get("/", protect, getHeroSections);
router.get("/:id", protect, getHeroSectionById);
router.post("/", protect, createHeroSection);
router.put("/:id", protect, updateHeroSection);
router.delete("/:id", protect, deleteHeroSection);

module.exports = router;
