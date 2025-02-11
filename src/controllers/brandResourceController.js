const prisma = require("../prisma");

// Upload multiple resources for a specific brand
const createBrandResources = async (req, res) => {
  try {
    const { brandId } = req.body;
    const files = req.files.resourceFile || [];

    if (!files.length) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Map files to create entries in the database
    const resources = await Promise.all(
      files.map((file) =>
        prisma.brandResource.create({
          data: {
            filePath: `/uploads/${file.filename}`,
            fileType: file.mimetype,
            brand: {
              connect: { id: parseInt(brandId) },
            },
          },
        })
      )
    );

    res.status(201).json({
      message: "Resources uploaded successfully",
      resources,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a specific resource for a brand
const deleteBrandResource = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const existingResource = await prisma.brandResource.findUnique({
      where: { id: parseInt(resourceId) },
    });

    if (!existingResource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    await prisma.brandResource.delete({ where: { id: parseInt(resourceId) } });

    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBrandResources,
  deleteBrandResource,
};
