const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const deleteRecordMiddleware = require("../../middlewares/deleteMiddleware");
const upload = require("../../middlewares/uploadMiddleware");
const { getAllContactInquiries, getContactInquiryById, updateContactInquiry } = require("../../controllers/contactInquiryController");
const router = express.Router();

router.get("/", getAllContactInquiries);
router.get("/all", protect, getAllContactInquiries);
router.get("/:id", protect, getContactInquiryById);
router.put("/:id", protect, updateContactInquiry);
router.delete("/:id", protect, deleteRecordMiddleware("contactInquiry"));

module.exports = router; 