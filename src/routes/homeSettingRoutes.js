const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const { 
  getHomeSettings, 
  updateHomeSettings,
  getHomepage,
  createHomeSettings,
  deleteHomeSettings
} = require("../controllers/homeSettingController");

const router = express.Router();

router.get("/", getHomeSettings);
router.get("/featured", getHomepage);
router.post("/", upload.single("heroImage"), protect, createHomeSettings);
router.put("/", upload.single("heroImage"), protect, updateHomeSettings);
router.delete("/", protect, deleteHomeSettings);

module.exports = router;
