const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const {
  createWebsiteSocial,
  updateWebsiteSocial,
} = require("../controllers/websiteSocialController");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deletemiddleware");

const router = express.Router();

router.get("/", paginationMiddleware("websiteSocial"));

router.post("/", upload.single("icon"), protect, createWebsiteSocial);

router.put("/:id", upload.single("icon"), protect, updateWebsiteSocial);

router.delete("/:id", protect, deleteRecordMiddleware("websiteSocial"));

module.exports = router;
