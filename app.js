const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

// Import routes

const eventRoutes = require("./src/routes/eventRoutes");
const userRoutes = require("./src/routes/userRoutes");
const passwordResetRoutes = require("./src/routes/passwordResetRoutes");
const roleRoutes = require("./src/routes/roleRoutes");
const permissionsRoutes = require("./src/routes/PermissionRoutes");

// Import new Zaga Mall routes
const storeRoutes = require("./src/routes/storeRoutes");
const diningRoutes = require("./src/routes/diningRoutes");
const promotionRoutes = require("./src/routes/promotionRoutes");
const teamMemberRoutes = require("./src/routes/teamMemberRoutes");
const faqRoutes = require("./src/routes/faqRoutes");
const faqCategoryRoutes = require("./src/routes/faqCategoryRoutes");
const diningCategoryRoutes = require("./src/routes/diningCategoryRoutes");
const contactInquiryRoutes = require("./src/routes/contactInquiryRoutes");
const homeSettingRoutes = require("./src/routes/homeSettingRoutes");
const brandRoutes = require("./src/routes/brandRoutes");
const locationRoutes = require("./src/routes/locationRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const resourceRoutes = require('./src/routes/resourceRoutes');
const officeRoutes = require('./src/routes/officeRoutes');
const entertainmentAndSportRoutes = require('./src/routes/entertainmentAndSportRoutes');
const heroSectionRoutes = require('./src/routes/heroSectionRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const positionRoutes = require('./src/routes/positionRoutes');
const aboutRoutes = require('./src/routes/aboutRoutes');
const parkingRoutes = require('./src/routes/parkingRoutes');

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
    '*', // allow all origins for development
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
app.use("/users", userRoutes); // User routes
 app.use("/password", passwordResetRoutes); // Password reset routes
 app.use("/api/roles", roleRoutes); // Role routes
app.use("/permissions", permissionsRoutes); // Permissions routes

// Register new Zaga Mall routes.
app.use("/api/stores", storeRoutes);
app.use("/api/dining", diningRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/team-members", teamMemberRoutes);
app.use("/api/faq", faqRoutes); // Changed from /api/faqs to /api/faq
app.use("/api/faq-categories", faqCategoryRoutes);
app.use("/api/dining-categories", diningCategoryRoutes);
app.use("/api/contact", contactInquiryRoutes);
app.use("/api/home", homeSettingRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/auth", userRoutes); // Using existing userRoutes for auth
app.use("/api/locations", locationRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/resource', resourceRoutes);
app.use('/api/offices', officeRoutes);
app.use('/api/entertainment-sports', entertainmentAndSportRoutes);
app.use('/api/hero-section', heroSectionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/parkings', parkingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
