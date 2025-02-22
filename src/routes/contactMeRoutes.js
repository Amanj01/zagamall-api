const express = require("express");
const { protect } = require("../middlewares/authMiddleware");

const paginationMiddleware = require("../middlewares/paginationMiddleware");
const deleteRecordMiddleware = require("../middlewares/deletemiddleware");
const { createContactMessage } = require("../controllers/conactMeController");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/", paginationMiddleware("contactMe"));

router.post("/", upload.none(), createContactMessage);

router.delete("/:id", protect, deleteRecordMiddleware("contactMe"));

module.exports = router;
