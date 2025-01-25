const prisma = require("../prisma");

// Get a single brand by ID
const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await prisma.brand.findUnique({
      where: { id: parseInt(id) },
      include: {
        socials: true,
        items: true,
        comments: true,
        resources: true,
      },
    });

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new brand
const createBrand = async (req, res) => {
  try {
    const { name, description, showOnHomepage } = req.body;

    const cardImage = req.files?.cardImage?.[0]?.filename || null;
    const heroImage = req.files?.heroImage?.[0]?.filename || null;
    const logo = req.files?.logo?.[0]?.filename || null;

    const newBrand = await prisma.brand.create({
      data: {
        name,
        description,
        cardImage,
        heroImage,
        logo,
        showOnHomepage: showOnHomepage === "true",
      },
    });

    res.status(201).json(newBrand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing brand
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, showOnHomepage } = req.body;

    const cardImage = req.files?.cardImage?.[0]?.filename || null;
    const heroImage = req.files?.heroImage?.[0]?.filename || null;
    const logo = req.files?.logo?.[0]?.filename || null;

    const existingBrand = await prisma.brand.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const updatedBrand = await prisma.brand.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        cardImage: cardImage || existingBrand.cardImage,
        heroImage: heroImage || existingBrand.heroImage,
        logo: logo || existingBrand.logo,
        showOnHomepage: showOnHomepage === "true",
      },
    });

    res.status(200).json(updatedBrand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a brand
const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBrand = await prisma.brand.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    await prisma.brand.delete({ where: { id: parseInt(id) } });
    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
};
