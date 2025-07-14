const { verifyToken } = require("../utils/jwt");
const prisma = require("../prisma");

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }

  // Attach user and role to req.user
  const user = await prisma.user.findUnique({
    where: { id: parseInt(decoded.id) },
    include: { role: true },
  });
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  req.user = {
    id: user.id,
    email: user.email,
    role: user.role?.name || 'user',
    role_id: user.role_id
  };
  next();
};

// Usage: requireRole(['super_admin', 'admin'])
const requireRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }
  next();
};

module.exports = { protect, requireRole };
