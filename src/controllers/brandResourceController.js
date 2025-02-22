const prisma = require("../prisma");

// Upload multiple resources for a specific brand
const createBrandResources = async (req, res) => {
  try {
    const { brandId, title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const resources = await prisma.brandResource.create({
      data: {
        title,
        description,
        filePath: `/uploads/${file.filename}`,
        fileType: file.mimetype,
        brand: {
          connect: { id: parseInt(brandId) },
        },
      },
    });

    res.status(201).json({
      message: "Resources uploaded successfully",
      resources,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBrandResources,
};
