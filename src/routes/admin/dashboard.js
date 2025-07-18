const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const { getDashboardStats, getDashboardData } = require("../../controllers/dashboardController");
const router = express.Router();

router.get("/stats", protect, getDashboardStats);
router.get("/data", protect, getDashboardData);

module.exports = router;
