const prisma = require("../prisma");

// Get all socials for a specific brand
const getBrandSocials = async (req, res) => {
  try {
    const { id } = req.params;
    const socials = await prisma.brandSocial.findMany({
      where: { brandId: parseInt(id) },
    });
    res.status(200).json(socials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new social link for a specific brand
const createBrandSocial = async (req, res) => {
  try {
    const { name, url, brandId } = req.body;

    const icon = req.file ? `/uploads/${req.file.filename}` : null;

    const social = await prisma.brandSocial.create({
      data: {
        name,
        url,
        icon,
        brand: {
          connect: { id: parseInt(brandId) },
        },
      },
    });

    res.status(201).json(social);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a specific social link for a brand
const updateBrandSocial = async (req, res) => {
  try {
    const { socialId } = req.params;
    const { name, url } = req.body;

    const icon = req.file ? `/uploads/${req.file.filename}` : null;

    const existingSocial = await prisma.brandSocial.findUnique({
      where: { id: parseInt(socialId) },
    });

    if (!existingSocial) {
      return res.status(404).json({ message: "Social link not found" });
    }

    const updatedSocial = await prisma.brandSocial.update({
      where: { id: parseInt(socialId) },
      data: {
        name,
        url,
        icon: icon || existingSocial.icon,
        brand: {
          connect: { id: parseInt(brandId) },
        },
      },
    });

    res.status(200).json(updatedSocial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a specific social link for a brand
const deleteBrandSocial = async (req, res) => {
  try {
    const { socialId } = req.params;

    const existingSocial = await prisma.brandSocial.findUnique({
      where: { id: parseInt(socialId) },
    });

    if (!existingSocial) {
      return res.status(404).json({ message: "Social link not found" });
    }

    await prisma.brandSocial.delete({ where: { id: parseInt(socialId) } });
    res.status(200).json({ message: "Social link deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBrandSocials,
  createBrandSocial,
  updateBrandSocial,
  deleteBrandSocial,
};
