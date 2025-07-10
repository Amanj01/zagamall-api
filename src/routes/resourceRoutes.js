const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const { getResourceById, createResources } = require("../controllers/resourceController");

const router = express.Router();

// Upload a resource (image/file)
router.post("/", upload.single("file"), protect, createResources);

// Get a resource by ID
router.get("/:id", getResourceById);

module.exports = router; 