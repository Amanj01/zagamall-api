const prisma = require("../prisma");
const bcrypt = require("bcrypt");
const { generateToken, verifyToken } = require("../utils/jwt");
const emailService = require("../email/emailService");

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, username, role_id } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or username already exists" });
    }

    const existingRole = await prisma.role.findUnique({
      where: { id: role_id },
    });

    if (!existingRole) {
      return res.status(400).json({ message: "Invalid role ID" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        username,
        role: {
          connect: { id: role_id },
        },
      },
    });

    res.status(201).json({
      message: "User registered successfully",
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
      hashedPassword = await bcrypt.hash(password, 10);
    }

    if (role_id) {
      const existingRole = await prisma.role.findUnique({
        where: { id: role_id },
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
        ...(role_id && { role: { connect: { id: role_id } } }),
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
