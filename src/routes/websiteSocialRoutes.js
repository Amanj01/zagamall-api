const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const {
  createWebsiteSocial,
  updateWebsiteSocial,
  deleteWebsiteSocial,
} = require("../controllers/websiteSocialController");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");

const router = express.Router();

router.get("/", paginationMiddleware("websiteSocial"));

router.post("/", upload.single("icon"), protect, createWebsiteSocial);

router.put("/:id", upload.single("icon"), protect, updateWebsiteSocial);

router.delete("/:id", protect, deleteWebsiteSocial);

module.exports = router;
