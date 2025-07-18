const express = require("express");
const { getAllParkings, getParkingById } = require("../../controllers/parkingController");
const router = express.Router();

router.get("/", getAllParkings);
router.get("/:id", getParkingById);

module.exports = router; 