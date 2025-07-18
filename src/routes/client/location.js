const express = require("express");
const { getAllLocations, getLocationById, getLocationsByType } = require("../../controllers/locationController");
const router = express.Router();

router.get("/", getAllLocations);
router.get("/type/:type", getLocationsByType);
router.get("/:id", getLocationById);

module.exports = router; 