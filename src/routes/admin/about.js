const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware");
const { getAboutSections, getAboutSectionById, createAboutSection, updateAboutSection, deleteAboutSection } = require("../../controllers/aboutController");
const router = express.Router();

router.get("/", getAboutSections);
router.get("/:id", protect, getAboutSectionById);
router.post("/", protect, upload.single('image'), createAboutSection);
router.put("/:id", protect, upload.single('image'), updateAboutSection);
router.delete("/:id", protect, deleteAboutSection);

module.exports = router; 