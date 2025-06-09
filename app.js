const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

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
const aboutRoutes = require("./src/routes/aboutRoutes");
const teamMemberRoutes = require("./src/routes/teamMemberRoutes");
const faqRoutes = require("./src/routes/faqRoutes");
const contactInquiryRoutes = require("./src/routes/contactInquiryRoutes");
const homeSettingRoutes = require("./src/routes/homeSettingRoutes");
const brandRoutes = require("./src/routes/brandRoutes");
const locationRoutes = require("./src/routes/locationRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");

const extractClientIp = require("./src/middlewares/clientIpMiddleware");

dotenv.config();

const app = express();

app.use(extractClientIp);
app.use(express.json());
app.use(cors());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "/uploads/"))
);
app.use("/images", express.static(path.join(__dirname, "/src/assets/images/")));

// Register routes

app.use("/users", userRoutes); // User routes
 app.use("/password", passwordResetRoutes); // Password reset routes
 app.use("/roles", roleRoutes); // Role routes
app.use("/permissions", permissionsRoutes); // Permissions routes

// Register new Zaga Mall routes.
app.use("/api/stores", storeRoutes);
app.use("/api/dining", diningRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/team-members", teamMemberRoutes);
app.use("/api/faq", faqRoutes); // Changed from /api/faqs to /api/faq
app.use("/api/contact", contactInquiryRoutes);
app.use("/api/home", homeSettingRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/auth", userRoutes); // Using existing userRoutes for auth
app.use("/api/locations", locationRoutes);
app.use("/api/categories", categoryRoutes);

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
