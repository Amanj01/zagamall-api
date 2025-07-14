const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");
const {
  getOffices,
  getOfficeById,
  createOffice,
  updateOffice,
  deleteOffice,
  deleteOfficeGalleryImage,
} = require("../controllers/officeController");

const router = express.Router();

// List offices with advanced pagination, search, filter
router.get("/", getOffices);
// Get single office by ID
router.get("/:id", getOfficeById);
// Create office
router.post("/", protect, createOffice);
// Update office
router.put("/:id", protect, updateOffice);
// Delete office
router.delete("/:id", protect, deleteOffice);
// Delete a gallery image
router.delete("/gallery/:id", protect, deleteOfficeGalleryImage);

module.exports = router; 