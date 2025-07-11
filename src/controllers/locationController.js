const prisma = require("../prisma");

// Get all locations
const getAllLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany();
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific location by ID
const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await prisma.location.findUnique({
      where: { id: parseInt(id) },
      include: {
        stores: true,
      },
    });

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new location
const createLocation = async (req, res) => {
  try {
    const { level, number, type, locationByDescription } = req.body;

    const location = await prisma.location.create({
      data: {
        level,
        number,
        type,
        locationByDescription,
      },
    });

    res.status(201).json({ message: "Location created successfully", location });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a location
const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { level, number, type, locationByDescription } = req.body;

    const existingLocation = await prisma.location.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingLocation) {
      return res.status(404).json({ message: "Location not found" });
    }

    const updatedLocation = await prisma.location.update({
      where: { id: parseInt(id) },
      data: {
        level,
        number,
        type,
        locationByDescription,
      },
    });

    res.status(200).json({
      message: "Location updated successfully",
      location: updatedLocation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get only store locations
const getStoreLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      where: { type: 'STORE' },
    });
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get only office locations
const getOfficeLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      where: { type: 'OFFICE' },
    });
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  getStoreLocations,
  getOfficeLocations,
};
