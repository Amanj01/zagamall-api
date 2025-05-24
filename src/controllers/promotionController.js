const prisma = require("../prisma");
const { deleteFile } = require("../utils/utility");

// Get all promotions
const getAllPromotions = async (req, res) => {
  try {
    const promotions = await prisma.promotion.findMany();
    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific promotion by ID
const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await prisma.promotion.findUnique({
      where: { id: parseInt(id) },
    });

    if (!promotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.status(200).json(promotion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new promotion
const createPromotion = async (req, res) => {
  try {
    const { title, period, stores, description, isShowInHome } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const promotion = await prisma.promotion.create({
      data: {
        title,
        period,
        stores,
        description,
        imagePath,
        isShowInHome: isShowInHome === "true",
      },
    });

    res.status(201).json({ message: "Promotion created successfully", promotion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a promotion
const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, period, stores, description, isShowInHome } = req.body;

    const existingPromotion = await prisma.promotion.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPromotion) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : existingPromotion.imagePath;

    const updatedPromotion = await prisma.promotion
      .update({
        where: { id: parseInt(id) },
        data: {
          title,
          period,
          stores,
          description,
          imagePath,
          isShowInHome: isShowInHome === "true",
        },
      })
      .then((data) => {
        if (req.file && existingPromotion.imagePath) {
          deleteFile(existingPromotion.imagePath);
        }
        return data;
      });

    res.status(200).json({
      message: "Promotion updated successfully",
      promotion: updatedPromotion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
};
