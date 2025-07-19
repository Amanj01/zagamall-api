const express = require("express");
const { protect } = require("../../middlewares/authMiddleware");
const { getDashboardStats, getDashboardData } = require("../../controllers/dashboardController");
const router = express.Router();

// Root dashboard endpoint - serves the same data as /data
router.get("/", protect, getDashboardData);
router.get("/stats", protect, getDashboardStats);
router.get("/data", protect, getDashboardData);

module.exports = router;
