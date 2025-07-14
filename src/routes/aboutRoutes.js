const express = require("express");
const {
  getAboutSections,
  getAboutSectionById,
  createAboutSection,
  updateAboutSection,
  deleteAboutSection,
} = require("../controllers/aboutController");
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// About section endpoints
router.get("/", getAboutSections);
router.get("/:id", getAboutSectionById);
router.post("/", upload.single('image'), createAboutSection);
router.put("/:id", upload.single('image'), updateAboutSection);
router.delete("/:id", deleteAboutSection);

module.exports = router; 