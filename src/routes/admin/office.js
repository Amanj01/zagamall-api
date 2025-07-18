const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware");
const { getOffices, getOfficeById, createOffice, updateOffice, deleteOffice, deleteOfficeGalleryImage } = require("../../controllers/officeController");
const router = express.Router();

router.get("/", getOffices);
router.get("/:id", protect, getOfficeById);
router.post("/", protect, createOffice);
router.put("/:id", protect, updateOffice);
router.delete("/:id", protect, deleteOffice);
router.delete("/gallery/:id", protect, deleteOfficeGalleryImage);

module.exports = router; 