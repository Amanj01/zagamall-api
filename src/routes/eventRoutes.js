const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEventImage,
} = require("../controllers/eventController");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");

const router = express.Router();

router.get(
  "/",
  getEvents
);

router.get("/:id", getEventById);

router.post(
  "/",
  protect,
  createEvent
);
router.put(
  "/:id",
  protect,
  updateEvent
);

router.delete("/:id", protect, deleteRecordMiddleware("event", true));

module.exports = router;
