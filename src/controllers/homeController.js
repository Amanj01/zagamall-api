const prisma = require("../prisma");
const { deleteFile } = require("../utils/utility");

// Get a specific home by ID
const getHomeById = async (req, res) => {
  try {
    const { id } = req.params;

    const home = await prisma.home.findUnique({
      where: { id: parseInt(id) },
    });

    if (!home) {
      return res.status(404).json({ message: "Home not found" });
    }

    res.status(200).json(home);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get active home page
const getHome = async (req, res) => {
  try {
    const home = await prisma.home.findFirst({
      where: { active: true },
    });

    const items = await prisma.item.findMany({
      where: { showOnHomepage: true },
      include: { brand: { select: { id: true, name: true } } },
      omit: { createdAt: true },
    });

    const comments = await prisma.comment.findMany({
      where: { showOnHomepage: true },
      include: { brand: { select: { id: true, name: true } } },
      omit: { createdAt: true },
    });

    const socials = await prisma.websiteSocial.findMany({
      omit: { createdAt: true },
    });

    const brands = await prisma.brand.findMany({
      select: { id: true, name: true, logo: true },
    });

    res.status(200).json({ ...home, brands, comments, items, socials });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new home
const createHome = async (req, res) => {
  try {
    const { title, description, active } = req.body;
    const file = req.file;
    const home = await prisma.home.create({
      data: {
        title,
        description,
        coverMedia: `/uploads/${file.filename}`,
        active: active === "true",
      },
    });

    res.status(201).json({ message: "home created successfully", home });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a home
const updateHome = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, active } = req.body;

    const existingHome = await prisma.home.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingHome) {
      return res.status(404).json({ message: "Home not found" });
    }

    const file = req.file;

    let updatedHome;

    if (active === "true" && existingHome.active !== true) {
      const result = await prisma.$transaction([
        prisma.home.updateMany({
          data: { active: false },
        }),
        prisma.home.update({
          where: { id: parseInt(id) },
          data: {
            title,
            description,
            coverMedia: file
              ? `/uploads/${file.filename}`
              : existingHome.coverMedia,
            active: true,
          },
        }),
      ]);
      updatedHome = result[1];
    } else {
      updatedHome = await prisma.home.update({
        where: { id: parseInt(id) },
        data: {
          title,
          description,
          coverMedia: file
            ? `/uploads/${file.filename}`
            : existingHome.coverMedia,
          active: active === "true",
        },
      });
    }

    if (file) {
      deleteFile(existingHome.coverMedia);
    }

    res.status(200).json({
      message: "Home updated successfully",
      home: updatedHome,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getHomeById,
  getHome,
  createHome,
  updateHome,
};
