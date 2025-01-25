const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const {
  getWebsiteSocials,
  createWebsiteSocial,
  updateWebsiteSocial,
  deleteWebsiteSocial,
} = require("../controllers/websiteSocialController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", getWebsiteSocials);

router.post("/", upload.single("icon"), protect, createWebsiteSocial);

router.put("/:id", upload.single("icon"), protect, updateWebsiteSocial);

router.delete("/:id", protect, deleteWebsiteSocial);

module.exports = router;
