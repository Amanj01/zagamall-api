const express = require("express");
const dotenv = require("dotenv");

// Import routes
const brandRoutes = require("./routes/brandRoutes");
const brandSocialRoutes = require("./routes/brandSocialRoutes");
const itemRoutes = require("./routes/itemRoutes");
const commentRoutes = require("./routes/commentRoutes");
const brandResourceRoutes = require("./routes/brandResourceRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const blogRoutes = require("./routes/blogRoutes");
const eventRoutes = require("./routes/eventRoutes");
const userRoutes = require("./routes/userRoutes");
const passwordResetRoutes = require("./routes/passwordResetRoutes");
const websiteSocialRoutes = require("./routes/websiteSocialRoutes");
const extractClientIp = require("./middlewares/clientIpMiddleware");

dotenv.config();

const app = express();

app.use(extractClientIp);
app.use(express.json());

// Serve static files
app.use("/uploads", express.static("src/assets/uploads"));

// Register routes
app.use("/brands", brandRoutes); // Brand routes
app.use("/brands", brandSocialRoutes); // Brand Socials routes
app.use("/brands", itemRoutes); // Item routes
app.use("/brands", commentRoutes); // Comment routes
app.use("/brands", brandResourceRoutes); // Brand Resource routes
app.use("/resources", resourceRoutes); // Resource routes
app.use("/blogs", blogRoutes); // Blog routes
app.use("/events", eventRoutes); // Event routes
app.use("/users", userRoutes); // User routes
app.use("/website-socials", websiteSocialRoutes); // Brand socials routes
app.use("/password", passwordResetRoutes); // Password reset routes

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
