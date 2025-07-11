const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const {
  getHeroSections,
  getHeroSectionById,
  createHeroSection,
  updateHeroSection,
  deleteHeroSection,
  reorderHeroSections,
  getHomepageHeroSections
} = require("../controllers/heroSectionController");

const router = express.Router();

// Public routes
router.get("/homepage", getHomepageHeroSections);

// Protected routes (require authentication)
router.get("/", getHeroSections);
router.get("/:id", getHeroSectionById);
router.post("/", protect, createHeroSection);
router.put("/:id", protect, updateHeroSection);
router.delete("/:id", protect, deleteHeroSection);
router.put("/reorder", protect, reorderHeroSections);

module.exports = router; 