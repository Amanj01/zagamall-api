const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");
const { 
  getAllContactInquiries,
  submitContactInquiry,
  getContactInquiryById,
  updateContactInquiry 
} = require("../controllers/contactInquiryController");

const router = express.Router();

router.get("/", protect, getAllContactInquiries);
router.get("/all", protect, getAllContactInquiries);
router.get("/:id", protect, getContactInquiryById);
router.post("/submit", upload.none(), submitContactInquiry);
router.put("/:id", upload.none(), protect, updateContactInquiry);
router.delete("/:id", protect, deleteRecordMiddleware("contactInquiry"));

module.exports = router;
