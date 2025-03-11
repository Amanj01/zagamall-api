const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const {
  getResourceById,
  createResources,
} = require("../controllers/resourceController");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");

const router = express.Router();

router.get("/", paginationMiddleware("resource"));

router.get("/:id", getResourceById);

router.post("/", upload.single("resourceFile"), protect, createResources);

router.delete("/:id", protect, deleteRecordMiddleware("resource"));

module.exports = router;
