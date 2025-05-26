const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const { 
  getAbout,
  createAbout,
  updateAbout, 
  deleteAbout
} = require("../controllers/aboutController");

const router = express.Router();

// GET /api/about - Get about information
router.get("/", getAbout);

// POST /api/about - Create about information (protected, with image upload)
router.post("/", upload.single("image"), protect, createAbout);

// PUT /api/about - Update about information (protected, with image upload)
router.put("/", upload.single("image"), protect, updateAbout);

// DELETE /api/about - Delete about information (protected)
router.delete("/", protect, deleteAbout);

module.exports = router;
