const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const { 
  getAllAboutSections,
  getAboutSection, 
  updateAboutSection,
  createAboutSection,
  deleteAboutSection 
} = require("../controllers/aboutController");

const router = express.Router();

router.get("/", paginationMiddleware("about")); 
router.get("/all", getAllAboutSections);
router.get("/:section", getAboutSection);
router.post("/", upload.single("image"), protect, createAboutSection);
router.put("/:section", upload.single("image"), protect, updateAboutSection);
router.delete("/:section", protect, deleteAboutSection);

module.exports = router;
