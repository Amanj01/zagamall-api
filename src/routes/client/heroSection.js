const express = require("express");
const { 
  getHeroSections,
  getHeroSectionById
} = require("../../controllers/heroSectionController");

const router = express.Router();

router.get("/", getHeroSections);
router.get("/:id", getHeroSectionById);

module.exports = router;
