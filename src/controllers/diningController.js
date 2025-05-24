const prisma = require("../prisma");
const { deleteFile } = require("../utils/utility");

// Get all dining options
const getAllDinings = async (req, res) => {
  try {
    const dinings = await prisma.dining.findMany();
    res.status(200).json(dinings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific dining option by ID
const getDiningById = async (req, res) => {
  try {
    const { id } = req.params;

    const dining = await prisma.dining.findUnique({
      where: { id: parseInt(id) },
    });

    if (!dining) {
      return res.status(404).json({ message: "Dining option not found" });
    }

    res.status(200).json(dining);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new dining option
const createDining = async (req, res) => {
  try {
    const { name, category, location, description, hours, rating, isShowInHome } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const dining = await prisma.dining.create({
      data: {
        name,
        category,
        location,
        description,
        hours,
        rating: parseFloat(rating),
        imagePath,
        isShowInHome: isShowInHome === "true",
      },
    });

    res.status(201).json({ message: "Dining option created successfully", dining });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a dining option
const updateDining = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, location, description, hours, rating, isShowInHome } = req.body;

    const existingDining = await prisma.dining.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingDining) {
      return res.status(404).json({ message: "Dining option not found" });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : existingDining.imagePath;

    const updatedDining = await prisma.dining
      .update({
        where: { id: parseInt(id) },
        data: {
          name,
          category,
          location,
          description,
          hours,
          rating: rating ? parseFloat(rating) : existingDining.rating,
          imagePath,
          isShowInHome: isShowInHome === "true",
        },
      })
      .then((data) => {
        if (req.file && existingDining.imagePath) {
          deleteFile(existingDining.imagePath);
        }
        return data;
      });

    res.status(200).json({
      message: "Dining option updated successfully",
      dining: updatedDining,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllDinings,
  getDiningById,
  createDining,
  updateDining,
};
