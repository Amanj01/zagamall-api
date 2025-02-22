const prisma = require("../prisma");
const { deleteFile } = require("../utils/utility");

const getWebsiteSocialById = async (req, res) => {
  try {
    const { id } = req.params;

    const websiteSocial = await prisma.websiteSocial.findUnique({
      where: { id: parseInt(id) },
    });

    if (!websiteSocial) {
      return res.status(404).json({ message: "Website social not found" });
    }

    res.status(200).json(websiteSocial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new website social link
const createWebsiteSocial = async (req, res) => {
  try {
    const { name, url } = req.body;

    const icon = req.file ? `/uploads/${req.file.filename}` : null;

    const newSocial = await prisma.websiteSocial.create({
      data: {
        name,
        url,
        icon,
      },
    });

    res.status(201).json({
      message: "Website social link created successfully",
      social: newSocial,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a specific website social link
const updateWebsiteSocial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url } = req.body;
    const icon = req.file ? `/uploads/${req.file.filename}` : null;

    const existingSocial = await prisma.websiteSocial.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingSocial) {
      return res.status(404).json({ message: "Website social link not found" });
    }

    const updatedSocial = await prisma.websiteSocial
      .update({
        where: { id: parseInt(id) },
        data: {
          name,
          url,
          icon: icon || existingSocial.icon,
        },
      })
      .then((data) => {
        if (icon) deleteFile(existingSocial.icon);
        return data;
      });

    res.status(200).json({
      message: "Website social link updated successfully",
      social: updatedSocial,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getWebsiteSocialById,
  createWebsiteSocial,
  updateWebsiteSocial,
};
