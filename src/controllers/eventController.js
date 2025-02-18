const prisma = require("../prisma");

// Get a specific event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: { gallery: true },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new event
const createEvent = async (req, res) => {
  try {
    const { title, content, showOnHomepage } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        content,
        showOnHomepage: showOnHomepage === "true",
        coverImage: `/uploads/${req.files.coverImage[0].filename}`,
      },
    });

    // Handle image uploads for gallery
    const gelleryFiles = req.files.gallery || [];
    if (gelleryFiles.length > 0) {
      await Promise.all(
        gelleryFiles.map((file) =>
          prisma.eventGallery.create({
            data: {
              imagePath: `/uploads/${file.filename}`,
              event: {
                connect: { id: parseInt(event.id) },
              },
            },
          })
        )
      );
    }

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, showOnHomepage } = req.body;

    const existingEvent = await prisma.event.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    const newCoverImage = req.files.coverImage[0].filename;
    const coverImage = newCoverImage
      ? `/uploads/${newCoverImage}`
      : existingEvent.coverImage;

    if (coverImage) deleteFile(existingEvent.coverImage);
    const updatedEvent = await prisma.event
      .update({
        where: { id: parseInt(id) },
        data: {
          title,
          content,
          showOnHomepage: showOnHomepage === "true",
          coverImage,
        },
      })
      .then((data) => {
        if (coverImage) deleteFile(existingEvent.coverImage);
        return data;
      });

    // Handle image uploads for gallery
    const gelleryFiles = req.files.gallery || [];
    if (gelleryFiles.length > 0) {
      await Promise.all(
        gelleryFiles.map((file) =>
          prisma.eventGallery.create({
            data: {
              imagePath: `/uploads/${file.filename}`,
              event: {
                connect: { id: parseInt(id) },
              },
            },
          })
        )
      );
    }

    res
      .status(200)
      .json({ message: "Event updated successfully", updatedEvent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a specific image from an event's gallery
const deleteEventImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const existingImage = await prisma.eventGallery.findUnique({
      where: { id: parseInt(imageId) },
    });

    if (!existingImage || existingImage.eventId !== parseInt(id)) {
      return res
        .status(404)
        .json({ message: "Image not found in the gallery" });
    }
    await prisma.eventGallery
      .delete({ where: { id: parseInt(imageId) } })
      .then(() => {
        deleteFile(existingImage.imagePath);
      });
    res.status(200).json({ message: "Image deleted from gallery" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEventById,
  createEvent,
  updateEvent,
  deleteEventImage,
};
