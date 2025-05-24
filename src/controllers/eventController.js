const prisma = require("../prisma");
const { deleteFile } = require("../utils/utility");

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
    const { title, content, showOnHomepage, coverImage } = req.body;
    
    // Validate title is provided
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    
    let eventCoverImage;
    
    // Check if cover image is provided as a file upload
    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      eventCoverImage = `/uploads/${req.files.coverImage[0].filename}`;
    } 
    // Check if cover image is provided as a URL in the request body
    else if (coverImage) {
      eventCoverImage = coverImage;
    } else {
      // No cover image provided
      return res.status(400).json({ error: "Cover image is required" });
    }

    const event = await prisma.event.create({
      data: {
        title: String(title),
        content: content || "",
        showOnHomepage: showOnHomepage === "true",
        coverImage: eventCoverImage,
      },
    });

    // Handle image uploads for gallery
    const gelleryFiles = req.files?.gallery || [];
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

    const newCoverImage = req.files && req.files.coverImage && req.files.coverImage[0]
      ? req.files.coverImage[0].filename
      : undefined;
    const coverImage = newCoverImage
      ? `/uploads/${newCoverImage}`
      : existingEvent.coverImage;

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
        if (newCoverImage) deleteFile(existingEvent.coverImage);
        return data;
      });

    // Handle image uploads for gallery
    const gelleryFiles = req.files?.gallery || [];
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
