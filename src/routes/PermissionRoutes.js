const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const paginationMiddleware = require("../middlewares/paginationMiddleware");

const router = express.Router();

router.get("/", protect, paginationMiddleware("permissions"));

module.exports = router;
