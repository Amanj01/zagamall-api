const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const { getAllParkings, getParkingById, createParking, updateParking, deleteParking } = require("../../controllers/parkingController");
const router = express.Router();

router.get("/", getAllParkings);
router.get("/:id", protect, getParkingById);
router.post("/", protect, createParking);
router.put("/:id", protect, updateParking);
router.delete("/:id", protect, deleteParking);

module.exports = router; 