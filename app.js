const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

// Import routes

const userRoutes = require("./src/routes/userRoutes");
const passwordResetRoutes = require("./src/routes/passwordResetRoutes");
const roleRoutes = require("./src/routes/roleRoutes");
const permissionsRoutes = require("./src/routes/PermissionRoutes");

// Import new Zaga Mall routes
const adminStoreRoutes = require("./src/routes/admin/store");
const clientStoreRoutes = require("./src/routes/client/store");
const adminDiningRoutes = require("./src/routes/admin/dining");
const clientDiningRoutes = require("./src/routes/client/dining");
const adminEventRoutes = require("./src/routes/admin/event");
const clientEventRoutes = require("./src/routes/client/event");
const adminFaqRoutes = require("./src/routes/admin/faq");
const clientFaqRoutes = require("./src/routes/client/faq");
const adminFaqCategoryRoutes = require("./src/routes/admin/faqCategory");
const clientFaqCategoryRoutes = require("./src/routes/client/faqCategory");
const adminPromotionRoutes = require("./src/routes/admin/promotion");
const clientPromotionRoutes = require("./src/routes/client/promotion");
const adminTeamMemberRoutes = require("./src/routes/admin/teamMember");
const clientTeamMemberRoutes = require("./src/routes/client/teamMember");
const adminDiningCategoryRoutes = require("./src/routes/admin/diningCategory");
const clientDiningCategoryRoutes = require("./src/routes/client/diningCategory");
const adminContactInquiryRoutes = require("./src/routes/admin/contactInquiry");
const clientContactInquiryRoutes = require("./src/routes/client/contactInquiry");
const adminBrandRoutes = require("./src/routes/admin/brand");
const clientBrandRoutes = require("./src/routes/client/brand");
const adminCategoryRoutes = require("./src/routes/admin/category");
const clientCategoryRoutes = require("./src/routes/client/category");
const adminLocationRoutes = require("./src/routes/admin/location");
const clientLocationRoutes = require("./src/routes/client/location");
const adminOfficeRoutes = require("./src/routes/admin/office");
const clientOfficeRoutes = require("./src/routes/client/office");
const adminEntertainmentAndSportRoutes = require("./src/routes/admin/entertainmentAndSport");
const clientEntertainmentAndSportRoutes = require("./src/routes/client/entertainmentAndSport");
const adminHomeSettingRoutes = require("./src/routes/admin/homeSetting");
const clientHomeSettingRoutes = require("./src/routes/client/homeSetting");
const adminPositionRoutes = require("./src/routes/admin/position");
const clientPositionRoutes = require("./src/routes/client/position");
const adminAboutRoutes = require("./src/routes/admin/about");
const clientAboutRoutes = require("./src/routes/client/about");
const adminParkingRoutes = require("./src/routes/admin/parking");
const clientParkingRoutes = require("./src/routes/client/parking");
const adminResourceRoutes = require("./src/routes/admin/resource");
const clientResourceRoutes = require("./src/routes/client/resource");
const adminItemRoutes = require("./src/routes/admin/item");
const clientItemRoutes = require("./src/routes/client/item");
const adminDashboardRoutes = require("./src/routes/admin/dashboard");
const clientDashboardRoutes = require("./src/routes/client/dashboard");
const adminHeroSectionRoutes = require("./src/routes/admin/heroSection");
const clientHeroSectionRoutes = require("./src/routes/client/heroSection");

const extractClientIp = require("./src/middlewares/clientIpMiddleware");


const app = express();

// Security headers
app.use(helmet());

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}

app.use(extractClientIp);
app.use(compression()); // Enable gzip compression
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
    "http://localhost:2000",
    'http://localhost:5174', // removed trailing slash
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    "https://admin.zagamallerbil.com",
    "https://api.zagamallerbil.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limit login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: "Too many login attempts, please try again later."
});


app.use("/images", express.static(path.join(__dirname, "/src/assets/images/")));
app.use("/uploads", express.static(path.join(__dirname, "uploads/")));

// Register routes

app.use("/users/login", loginLimiter);
app.use("/api/auth/login", loginLimiter); // Rate limiter for auth alias
app.use("/users", userRoutes); // User routes
app.use("/api/auth", userRoutes); // Auth routes alias for frontend compatibility
app.use("/admin/api/users", userRoutes); // Admin user routes alias
app.use("/password", passwordResetRoutes); // Password reset routes
app.use("/api/roles", roleRoutes); // Role routes
app.use("/permissions", permissionsRoutes); // Permissions routes

// Add common API aliases (for frontend compatibility)
app.use("/api/about", adminAboutRoutes); // About routes alias
app.use("/api/dashboard", adminDashboardRoutes); // Dashboard routes alias
app.use("/api/hero-sections", adminHeroSectionRoutes); // Hero sections routes alias
app.use("/api/faq-categories", adminFaqCategoryRoutes); // FAQ categories routes alias
app.use("/api/dining-categories", adminDiningCategoryRoutes); // Dining categories routes alias
app.use("/api/entertainment-sports", adminEntertainmentAndSportRoutes); // Entertainment sports routes alias
app.use("/api/positions", adminPositionRoutes); // Positions routes alias
app.use("/api/parkings", adminParkingRoutes); // Parkings routes alias
app.use("/api/offices", adminOfficeRoutes); // Offices routes alias
app.use("/api/brands", adminBrandRoutes); // Brands routes alias
app.use("/api/categories", adminCategoryRoutes); // Categories routes alias
app.use("/api/locations", adminLocationRoutes); // Locations routes alias
app.use("/api/stores", adminStoreRoutes); // Stores routes alias
app.use("/api/dining", adminDiningRoutes); // Dining routes alias
app.use("/api/events", adminEventRoutes); // Events routes alias
app.use("/api/faq", adminFaqRoutes); // FAQ routes alias
app.use("/api/promotions", adminPromotionRoutes); // Promotions routes alias
app.use("/api/team-members", adminTeamMemberRoutes); // Team members routes alias
app.use("/api/contact", adminContactInquiryRoutes); // Contact routes alias
app.use("/api/items", adminItemRoutes); // Items routes alias

// Register new Zaga Mall routes.
app.use("/client/api/stores", clientStoreRoutes);
app.use("/admin/api/stores", adminStoreRoutes);
app.use("/client/api/dining", clientDiningRoutes);
app.use("/admin/api/dining", adminDiningRoutes);
app.use("/client/api/events", clientEventRoutes);
app.use("/admin/api/events", adminEventRoutes);
app.use("/client/api/faq", clientFaqRoutes);
app.use("/admin/api/faq", adminFaqRoutes);
app.use("/client/api/faq-categories", clientFaqCategoryRoutes);
app.use("/admin/api/faq-categories", adminFaqCategoryRoutes);
app.use("/client/api/promotions", clientPromotionRoutes);
app.use("/admin/api/promotions", adminPromotionRoutes);
app.use("/client/api/team-members", clientTeamMemberRoutes);
app.use("/admin/api/team-members", adminTeamMemberRoutes);
app.use("/client/api/dining-categories", clientDiningCategoryRoutes);
app.use("/admin/api/dining-categories", adminDiningCategoryRoutes);
app.use("/client/api/contact", clientContactInquiryRoutes);
app.use("/admin/api/contact", adminContactInquiryRoutes);
app.use("/client/api/brands", clientBrandRoutes);
app.use("/admin/api/brands", adminBrandRoutes);
app.use("/client/api/categories", clientCategoryRoutes);
app.use("/admin/api/categories", adminCategoryRoutes);
app.use("/client/api/locations", clientLocationRoutes);
app.use("/admin/api/locations", adminLocationRoutes);
app.use("/client/api/offices", clientOfficeRoutes);
app.use("/admin/api/offices", adminOfficeRoutes);
app.use("/client/api/entertainment-sports", clientEntertainmentAndSportRoutes);
app.use("/admin/api/entertainment-sports", adminEntertainmentAndSportRoutes);
app.use("/client/api/home", clientHomeSettingRoutes);
app.use("/admin/api/home", adminHomeSettingRoutes);
app.use("/client/api/positions", clientPositionRoutes);
app.use("/admin/api/positions", adminPositionRoutes);
app.use("/client/api/about", clientAboutRoutes);
app.use("/admin/api/about", adminAboutRoutes);
app.use("/client/api/parkings", clientParkingRoutes);
app.use("/admin/api/parkings", adminParkingRoutes);
app.use("/client/api/resource", clientResourceRoutes);
app.use("/admin/api/resource", adminResourceRoutes);
app.use("/client/api/items", clientItemRoutes);
app.use("/admin/api/items", adminItemRoutes);
app.use("/client/api/dashboard", clientDashboardRoutes);
app.use("/admin/api/dashboard", adminDashboardRoutes);
app.use("/client/api/hero-sections", clientHeroSectionRoutes);
app.use("/admin/api/hero-sections", adminHeroSectionRoutes);
app.use("/admin/api/hero-section", adminHeroSectionRoutes); // If both singular and plural are needed, keep both

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // Server started successfully
});
