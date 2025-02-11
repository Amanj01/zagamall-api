const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const {
  getResourceById,
  createResources,
  deleteResource,
} = require("../controllers/resourceController");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");

const router = express.Router();

router.get("/", paginationMiddleware("resource"));

router.get("/:id", getResourceById);

router.post("/", upload.single("resourceFile"), protect, createResources);

router.delete("/:id", protect, deleteResource);

module.exports = router;
