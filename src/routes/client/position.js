const express = require("express");
const { getPositions, getActivePositions, getPositionById } = require("../../controllers/positionController");
const router = express.Router();

router.get("/", getPositions);
router.get("/active", getActivePositions);
router.get("/:id", getPositionById);

module.exports = router; 