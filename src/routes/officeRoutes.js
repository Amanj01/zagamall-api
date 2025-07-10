const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");
const {
  listOffices,
  getOfficeById,
  createOffice,
  updateOffice,
  deleteOffice,
  deleteOfficeGalleryImage,
} = require("../controllers/officeController");

const router = express.Router();

// List offices with advanced pagination, search, filter
router.get("/", listOffices);
// Get single office by ID
router.get("/:id", getOfficeById);
// Create office (cover + gallery images)
router.post(
  "/",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 30 }, // Increased maxCount for gallery images
  ]),
  createOffice
);
// Update office (cover + gallery images)
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 30 }, // Increased maxCount for gallery images
  ]),
  updateOffice
);
// Delete office
router.delete("/:id", protect, deleteOffice);
// Delete a gallery image
router.delete("/gallery/:id", protect, deleteOfficeGalleryImage);

module.exports = router; 