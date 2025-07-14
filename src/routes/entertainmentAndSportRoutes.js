const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const {
  getEntertainmentAndSports,
  getEntertainmentAndSportById,
  createEntertainmentAndSport,
  updateEntertainmentAndSport,
  deleteEntertainmentAndSport,
  deleteEntertainmentAndSportGalleryImage,
} = require("../controllers/entertainmentAndSportController");

// List with pagination, search, filter
router.get("/", getEntertainmentAndSports);
// Get single by ID
router.get("/:id", getEntertainmentAndSportById);
// Create (with gallery images)
router.post(
  "/",
  protect,
  upload.fields([
    { name: "gallery", maxCount: 30 }
  ]),
  createEntertainmentAndSport
);
// Update (with gallery images)
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "gallery", maxCount: 30 }
  ]),
  updateEntertainmentAndSport
);
// Delete
router.delete("/:id", protect, deleteEntertainmentAndSport);
// Delete gallery image
router.delete("/gallery/:id", protect, deleteEntertainmentAndSportGalleryImage);

module.exports = router; 