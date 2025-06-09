const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");
const { 
  getAllLocations,
  getLocationById, 
  createLocation, 
  updateLocation 
} = require("../controllers/locationController");

const router = express.Router();

router.get("/", paginationMiddleware("location"));
router.get("/all", getAllLocations);
router.get("/:id", getLocationById);
router.post("/", protect, createLocation);
router.put("/:id", protect, updateLocation);
router.delete("/:id", protect, deleteRecordMiddleware("location"));

module.exports = router;
