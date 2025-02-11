const prisma = require("../prisma");

// Get a specific resource by ID
const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(id) },
    });

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload multiple resources
const createResources = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    const test = await prisma.resource.create({
      data: {
        title,
        description,
        filePath: `/uploads/${file.filename}`,
      },
    });
    res.status(201).json({
      message: "Resources uploaded successfully",
      resource: test,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a specific resource
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const existingResource = await prisma.resource.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingResource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    await prisma.resource.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getResourceById,
  createResources,
  deleteResource,
};
