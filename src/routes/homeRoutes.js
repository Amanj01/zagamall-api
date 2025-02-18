const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");

const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deletemiddleware");
const {
  getHomeById,
  updateHome,
  createHome,
  getHome,
} = require("../controllers/homeController");

const router = express.Router();

router.get("/", protect, paginationMiddleware("home"));
router.get("/active", getHome);
router.get("/:id", protect, getHomeById);
router.post("/", upload.single("coverMedia"), protect, createHome);
router.put("/:id", upload.single("coverMedia"), protect, updateHome);
router.delete("/:id", protect, deleteRecordMiddleware("home"));

module.exports = router;
