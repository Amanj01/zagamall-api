const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const { getAllLocations, getLocationById, createLocation, updateLocation, deleteLocation, getLocationsByType } = require("../../controllers/locationController");
const router = express.Router();

router.get("/", getAllLocations);
router.get("/type/:type", protect, getLocationsByType);
router.get("/:id", protect, getLocationById);
router.post("/", protect, createLocation);
router.put("/:id", protect, updateLocation);
router.delete("/:id", protect, deleteLocation);

module.exports = router; 