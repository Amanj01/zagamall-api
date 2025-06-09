const prisma = require("../prisma");
const { deleteFile } = require("../utils/utility");

// Get all stores
const getAllStores = async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      include: {
        category: true,
        location: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.status(200).json(stores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific store by ID
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        location: true,
      },
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new store
const createStore = async (req, res) => {
  try {
    const { name, categoryId, locationId, description, isShowInHome } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const store = await prisma.store.create({
      data: {
        name,
        categoryId: parseInt(categoryId),
        locationId: parseInt(locationId),
        description,
        imagePath,
        isShowInHome: isShowInHome === "true",
      },
      include: {
        category: true,
        location: true,
      },
    });

    res.status(201).json({ message: "Store created successfully", store });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a store
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, locationId, description, isShowInHome } = req.body;

    const existingStore = await prisma.store.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingStore) {
      return res.status(404).json({ message: "Store not found" });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : existingStore.imagePath;

    const updatedStore = await prisma.store
      .update({
        where: { id: parseInt(id) },
        data: {
          name,
          categoryId: parseInt(categoryId),
          locationId: parseInt(locationId),
          description,
          imagePath,
          isShowInHome: isShowInHome === "true",
        },
        include: {
          category: true,
          location: true,
        },
      })
      .then((data) => {
        if (req.file && existingStore.imagePath) {
          deleteFile(existingStore.imagePath);
        }
        return data;
      });

    res.status(200).json({
      message: "Store updated successfully",
      store: updatedStore,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
};
