const prisma = require("../prisma");

// Get a single item for a specific brand
const getItemById = async (req, res) => {
  try {
    const { brandId, itemId } = req.params;

    const item = await prisma.item.findUnique({
      where: { id: parseInt(itemId) },
    });

    if (!item || item.brandId !== parseInt(brandId)) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new item for a specific brand
const createItem = async (req, res) => {
  try {
    const { name, description, showOnHomepage, brandId } = req.body;

    const cardImage = req.file ? `/uploads/${req.file.filename}` : null;

    const newItem = await prisma.item.create({
      data: {
        name,
        description,
        cardImage,
        showOnHomepage: showOnHomepage === "true",
        brand: {
          connect: { id: parseInt(brandId) },
        },
      },
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing item for a specific brand
const updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, description, showOnHomepage, brandId } = req.body;

    const cardImage = req.file ? `/uploads/${req.file.filename}` : null;

    const existingItem = await prisma.item.findUnique({
      where: { id: parseInt(itemId) },
    });

    if (!existingItem || existingItem.brandId !== parseInt(brandId)) {
      return res.status(404).json({ message: "Item not found" });
    }

    const updatedItem = await prisma.item
      .update({
        where: { id: parseInt(itemId) },
        data: {
          name,
          description,
          cardImage: cardImage || existingItem.cardImage,
          showOnHomepage: showOnHomepage === "true",
          brand: {
            connect: { id: parseInt(brandId) },
          },
        },
      })
      .then((data) => {
        if (cardImage) deleteFile(existingItem.cardImage);
        return data;
      });

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getItemById,
  createItem,
  updateItem,
};
