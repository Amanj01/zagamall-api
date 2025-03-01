const prisma = require("../prisma");
const { deleteFile } = require("../utils/utility");

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

const getBrandSocialById = async (req, res) => {
  try {
    const { id } = req.params;
    const brandSocial = await prisma.brandSocial.findUnique({
      where: { id: parseInt(id) },
    });

    if (!brandSocial) {
      return res.status(404).json({ message: "Brand social not found" });
    }

    res.status(200).json(brandSocial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a specific social link for a brand
const updateBrandSocial = async (req, res) => {
  try {
    const { socialId } = req.params;
    const { name, url, brandId } = req.body;

    const icon = req.file ? `/uploads/${req.file.filename}` : null;

    const existingSocial = await prisma.brandSocial.findUnique({
      where: { id: parseInt(socialId) },
    });

    if (!existingSocial) {
      return res.status(404).json({ message: "Social link not found" });
    }

    const updatedSocial = await prisma.brandSocial
      .update({
        where: { id: parseInt(socialId) },
        data: {
          name,
          url,
          icon: icon || existingSocial.icon,
          brand: {
            connect: { id: parseInt(brandId) },
          },
        },
      })
      .then((data) => {
        if (icon) deleteFile(existingSocial.icon);
        return data;
      });

    res.status(200).json(updatedSocial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBrandSocialById,
  createBrandSocial,
  updateBrandSocial,
};
