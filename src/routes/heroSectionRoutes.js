const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const { uploadErrorHandler } = require("../middlewares/uploadMiddleware");
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
router.post("/", protect, upload.single("image"), createHeroSection, uploadErrorHandler);
router.put("/:id", protect, upload.single("image"), updateHeroSection, uploadErrorHandler);
router.delete("/:id", protect, deleteHeroSection);
router.put("/reorder", protect, reorderHeroSections);

module.exports = router; 