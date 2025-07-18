const express = require("express");
const { submitContactInquiry } = require("../../controllers/contactInquiryController");
const router = express.Router();

router.post("/submit", submitContactInquiry);

module.exports = router; 