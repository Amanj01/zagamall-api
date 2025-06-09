const prisma = require("../prisma");
const { deleteFile } = require("../utils/utility");

// Get all brands
const getAllBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific brand by ID
const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { id: parseInt(id) },
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
    const { name, isShowInHome } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        image,
        isShowInHome: isShowInHome === "true",
      },
    });

    res.status(201).json({ message: "Brand created successfully", brand });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a brand
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isShowInHome } = req.body;

    const existingBrand = await prisma.brand.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const image = req.file
      ? `/uploads/${req.file.filename}`
      : existingBrand.image;

    const updatedBrand = await prisma.brand
      .update({
        where: { id: parseInt(id) },
        data: {
          name: name || existingBrand.name,
          image,
          isShowInHome:
            isShowInHome !== undefined
              ? isShowInHome === "true"
              : existingBrand.isShowInHome,
        },
      })
      .then((data) => {
        if (req.file && existingBrand.image) {
          deleteFile(existingBrand.image);
        }
        return data;
      });

    res
      .status(200)
      .json({ message: "Brand updated successfully", brand: updatedBrand });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
};
