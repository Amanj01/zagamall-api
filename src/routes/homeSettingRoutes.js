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
router.get("/homepage", getHomepage);
router.post("/", upload.none(), protect, createHomeSettings);
router.put("/", upload.none(), protect, updateHomeSettings);
router.delete("/", protect, deleteHomeSettings);

module.exports = router;
