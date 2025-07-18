const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware");
const { getEntertainmentAndSports, getEntertainmentAndSportById, createEntertainmentAndSport, updateEntertainmentAndSport, deleteEntertainmentAndSport, deleteEntertainmentAndSportGalleryImage } = require("../../controllers/entertainmentAndSportController");
const router = express.Router();

router.get("/", getEntertainmentAndSports);
router.get("/:id", protect, getEntertainmentAndSportById);
router.post("/", protect, upload.fields([{ name: "gallery", maxCount: 30 }]), createEntertainmentAndSport);
router.put("/:id", protect, upload.fields([{ name: "gallery", maxCount: 30 }]), updateEntertainmentAndSport);
router.delete("/:id", protect, deleteEntertainmentAndSport);
router.delete("/gallery/:id", protect, deleteEntertainmentAndSportGalleryImage);

module.exports = router; 