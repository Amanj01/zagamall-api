const express = require("express");
const { getEntertainmentAndSports, getEntertainmentAndSportById } = require("../../controllers/entertainmentAndSportController");
const router = express.Router();

router.get("/", getEntertainmentAndSports);
router.get("/:id", getEntertainmentAndSportById);

module.exports = router; 