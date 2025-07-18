const express = require("express");
const { getAboutSections, getAboutSectionById } = require("../../controllers/aboutController");
const router = express.Router();

router.get("/", getAboutSections);
router.get("/:id", getAboutSectionById);

module.exports = router; 