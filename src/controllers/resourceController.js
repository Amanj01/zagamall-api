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

    await prisma.resource.create({
      data: {
        title,
        description,
        filePath: `/uploads/${file.filename}`,
      },
    });
    res.status(201).json({
      message: "Resources uploaded successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getResourceById,
  createResources,
};
