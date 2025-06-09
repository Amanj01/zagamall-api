const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const {
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
  paginationMiddleware("event")
);

router.get("/:id", getEventById);

router.post(
  "/",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
  ]),
  protect,
  createEvent
);
router.put(
  "/:id",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
  ]),
  protect,
  updateEvent
);

router.delete("/:id", protect, deleteRecordMiddleware("event", true));

module.exports = router;
