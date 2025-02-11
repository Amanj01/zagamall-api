const prisma = require("../prisma");

// Get Role by ID
const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await prisma.role.findUnique({
      where: { id: parseInt(id) },
      include: { permissions: { omit: { createdAt: true, updatedAt: true } } },
      omit: { createdAt: true, updatedAt: true },
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    role.permissions = role.permissions.map((permission) => permission.id);
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Create a New Role
const createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      return res.status(400).json({ message: "Role already exists" });
    }

    const newRole = await prisma.role.create({
      data: {
        name,
        permissions: permissions.length
          ? { connect: permissions.map((id) => ({ id })) }
          : undefined,
      },
    });

    res
      .status(201)
      .json({ message: "Role created successfully", role: newRole });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a Role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions } = req.body;

    const existingRole = await prisma.role.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingRole) {
      return res.status(404).json({ message: "Role not found" });
    }

    const updatedRole = await prisma.role.update({
      where: { id: parseInt(id) },
      data: {
        name,
        permissions: permissions?.length
          ? { set: permissions.map((id) => ({ id })) }
          : undefined,
      },
    });

    res
      .status(200)
      .json({ message: "Role updated successfully", role: updatedRole });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a Role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRole = await prisma.role.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingRole) {
      return res.status(404).json({ message: "Role not found" });
    }

    await prisma.role.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
