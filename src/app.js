const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

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
const formRoutes = require("./routes/formRoutes");
const roleRoutes = require("./routes/roleRoutes");
const permissionsRoutes = require("./routes/PermissionRoutes");
const homeRoutes = require("./routes/homeRoutes");
const contactMeRoutes = require("./routes/contactMeRoutes");

const extractClientIp = require("./middlewares/clientIpMiddleware");

dotenv.config();

const app = express();

app.use(extractClientIp);
app.use(express.json());
app.use(cors());

// Serve static files
app.use("/uploads", express.static("src/assets/uploads"));

// Register routes
app.use("/brands", brandRoutes); // Brand routes  (CLient)
app.use("/brands-social", brandSocialRoutes); // Brand Socials routes
app.use("/comments", commentRoutes); // Comment routes   (CLient)
app.use("/items", itemRoutes); // Item routes   (CLient)
app.use("/brands-resources", brandResourceRoutes); // Brand Resource routes
app.use("/resources", resourceRoutes); // Resource routes  (CLient)
app.use("/blogs", blogRoutes); // Blog routes  (CLient)
app.use("/events", eventRoutes); // Event routes  (CLient)
app.use("/users", userRoutes); // User routes
app.use("/website-socials", websiteSocialRoutes); // Brand socials routes  (CLient)
app.use("/password", passwordResetRoutes); // Password reset routes
app.use("/forms", formRoutes); // Form routes  (CLient)
app.use("/roles", roleRoutes); // Role routes
app.use("/permissions", permissionsRoutes); // Permissions routes
app.use("/homes", homeRoutes); // Home routes  (CLient)
app.use("/contact-me", contactMeRoutes); // Contact-me routes  (CLient)

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
