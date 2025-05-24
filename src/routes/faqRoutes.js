const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deleteMiddleware");
const { 
  getAllFaqs,
  getFaqById, 
  createFaq, 
  updateFaq 
} = require("../controllers/faqController");

const router = express.Router();

router.get("/", paginationMiddleware("faq", ["category"]));
router.get("/all", getAllFaqs);
router.get("/:id", getFaqById);
router.post("/", upload.none(), protect, createFaq);
router.put("/:id", upload.none(), protect, updateFaq);
router.delete("/:id", protect, deleteRecordMiddleware("faq"));

module.exports = router;
