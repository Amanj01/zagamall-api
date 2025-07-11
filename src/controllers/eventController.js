const prisma = require("../prisma");
const { deleteCloudinaryImage } = require("../utils/utility");

// Get a specific event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
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
    const { title, content, startDate, endDate, startTime, isShowInHome } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    
    if (!startDate) {
      return res.status(400).json({ error: "Start date is required" });
    }
    
    if (!endDate) {
      return res.status(400).json({ error: "End date is required" });
    }
    
    if (!startTime) {
      return res.status(400).json({ error: "Start time is required" });
    }
    
    let eventCoverImage = req.body.coverImage;
    if (!eventCoverImage) {
      return res.status(400).json({ error: "Cover image is required" });
    }

    const event = await prisma.event.create({
      data: {
        title: String(title),
        content: content || "",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime: String(startTime),
        isShowInHome: isShowInHome === "true",
        coverImage: eventCoverImage,
      },
    });

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, startDate, endDate, startTime, isShowInHome } = req.body;

    const existingEvent = await prisma.event.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    const coverImage = req.body.coverImage || existingEvent.coverImage;
    // If coverImage changed, delete old Cloudinary image
    if (coverImage && coverImage !== existingEvent.coverImage && existingEvent.coverImage) {
      await deleteCloudinaryImage(existingEvent.coverImage);
    }

    const updatedEvent = await prisma.event
      .update({
        where: { id: parseInt(id) },
        data: {
          title,
          content,
          startDate: startDate ? new Date(startDate) : existingEvent.startDate,
          endDate: endDate ? new Date(endDate) : existingEvent.endDate,
          startTime: startTime || existingEvent.startTime,
          isShowInHome: isShowInHome === "true",
          coverImage,
        },
      })
      .then((data) => {
        return data;
      });

    res
      .status(200)
      .json({ message: "Event updated successfully", updatedEvent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEventById,
  createEvent,
  updateEvent,
};
