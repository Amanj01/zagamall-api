const express = require("express");
const { getResourceById } = require("../../controllers/resourceController");
const router = express.Router();

router.get("/:id", getResourceById);

module.exports = router; 