const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { 
  getPositions,
  getPositionById, 
  createPosition, 
  updatePosition,
  deletePosition,
  getActivePositions
} = require("../controllers/positionController");

const router = express.Router();

router.get("/", getPositions);
router.get("/active", getActivePositions);
router.get("/:id", getPositionById);
router.post("/", protect, createPosition);
router.put("/:id", protect, updatePosition);
router.delete("/:id", protect, deletePosition);

module.exports = router; 