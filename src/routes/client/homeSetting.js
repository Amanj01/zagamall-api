const express = require("express");
const { getHomeSettings, getHomepage } = require("../../controllers/homeSettingController");
const router = express.Router();

router.get("/", getHomeSettings);
router.get("/homepage", getHomepage);

module.exports = router; 