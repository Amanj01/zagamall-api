const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const {
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  deleteEventImage,
} = require("../controllers/eventController");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");

const router = express.Router();

router.get("/", paginationMiddleware("event"));

router.get("/:id", getEventById);

router.post("/", upload.array("gallery", 10), protect, createEvent);

router.put("/:id", upload.array("gallery", 10), protect, updateEvent);

router.delete("/:id", protect, deleteEvent);

router.delete("/:id/gallery/:imageId", protect, deleteEventImage);

module.exports = router;
