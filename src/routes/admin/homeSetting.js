const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const { getHomeSettings, updateHomeSettings, getHomepage, createHomeSettings, deleteHomeSettings } = require("../../controllers/homeSettingController");
const router = express.Router();

router.get("/", getHomeSettings);
router.get("/homepage", protect, getHomepage);
router.post("/", protect, createHomeSettings);
router.put("/", protect, updateHomeSettings);
router.delete("/", protect, deleteHomeSettings);

module.exports = router; 