const prisma = require("../prisma");

// Get all resources for a specific brand
const getBrandResources = async (req, res) => {
  try {
    const { brandId } = req.params;

    const resources = await prisma.brandResource.findMany({
      where: { brandId: parseInt(brandId) },
    });

    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload multiple resources for a specific brand
const createBrandResources = async (req, res) => {
  try {
    const { brandId } = req.params;
    const files = req.files.resourceFile || []; // Files uploaded via Multer

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
            brandId: parseInt(brandId),
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
    const { brandId, resourceId } = req.params;

    const existingResource = await prisma.brandResource.findUnique({
      where: { id: parseInt(resourceId) },
    });

    if (!existingResource || existingResource.brandId !== parseInt(brandId)) {
      return res.status(404).json({ message: "Resource not found" });
    }

    await prisma.brandResource.delete({ where: { id: parseInt(resourceId) } });

    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBrandResources,
  createBrandResources,
  deleteBrandResource,
};
