const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");
const { 
  getAllFaqs,
  getFaqById, 
  createFaq, 
  updateFaq, 
  deleteFaq
} = require("../controllers/faqController");

const router = express.Router();

router.get("/", getAllFaqs);
router.get("/:id", getFaqById);
router.post("/", createFaq);
router.put("/:id", updateFaq);
router.delete("/:id", deleteFaq);

module.exports = router;
