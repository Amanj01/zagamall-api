const express = require("express");
const upload = require("../../middlewares/uploadMiddleware");
const { protect } = require("../../middlewares/authMiddleware");
const { getResourceById, createResources } = require("../../controllers/resourceController");
const router = express.Router();

router.post("/", upload.single("file"), protect, createResources);
router.get("/:id", protect, getResourceById);

module.exports = router; 