const prisma = require("../prisma");
const bcrypt = require("bcrypt");
const { generateToken, verifyToken } = require("../utils/jwt");
const emailService = require("../email/emailService");

// Helper: strong password policy
function isStrongPassword(password) {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, username, password, role_id } = req.body;

    // Validate required fields
    if (!name || !email || !username || !password || !role_id) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["name", "email", "username", "password", "role_id"],
      });
    }

    // Enforce strong password
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      });
    }

    // Check if email already exists
    const emailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Check if username already exists
    const usernameExists = await prisma.user.findUnique({
      where: { username },
    });

    if (usernameExists) {
      return res.status(400).json({ message: "Username already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        role_id: parseInt(role_id),
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Log in a user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
      omit: { createdAt: true, updatedAt: true },
      include: {
        role: {
          include: {
            permissions: {
              omit: { createdAt: true, updatedAt: true, id: true },
            },
          },
          omit: { createdAt: true, updatedAt: true },
        },
      },
    });
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    // Compare the password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    emailService.sendNewLoginEmail(user.email, user.username, req.clientIp);
    delete user.password;
    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get the current user
const me = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id) },
      omit: { createdAt: true, updatedAt: true },
      include: {
        role: {
          include: {
            permissions: {
              omit: { createdAt: true, updatedAt: true, id: true },
            },
          },
          omit: { createdAt: true, updatedAt: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      omit: { createdAt: true, updatedAt: true, password: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a user's details
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, username, role_id, password } = req.body;

    let hashedPassword;
    if (password) {
      if (!isStrongPassword(password)) {
        return res.status(400).json({
          message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
        });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Only super_admin can update roles
    if (role_id && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: "Only super_admin can update user roles." });
    }

    if (role_id) {
      const existingRole = await prisma.role.findUnique({
        where: { id: parseInt(role_id) },
      });

      if (!existingRole) {
        return res.status(400).json({ message: "Invalid role ID" });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        username,
        ...(role_id && req.user.role === 'super_admin' && { role: { connect: { id: parseInt(role_id) } } }),
        ...(hashedPassword && { password: hashedPassword }),
      },
    });

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "Email or username already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  me,
};
