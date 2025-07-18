const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const { getPositions, getActivePositions, getPositionById, createPosition, updatePosition, deletePosition } = require("../../controllers/positionController");
const router = express.Router();

router.get("/", getPositions);
router.get("/active", protect, getActivePositions);
router.get("/:id", protect, getPositionById);
router.post("/", protect, createPosition);
router.put("/:id", protect, updatePosition);
router.delete("/:id", protect, deletePosition);

module.exports = router; 