const prisma = require("../prisma");
const { deleteFile } = require("../utils/utility");

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
    const { title, content, startDate, endDate, startTime, isShowInHome, coverImage } = req.body;
    
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
          startDate: startDate ? new Date(startDate) : existingEvent.startDate,
          endDate: endDate ? new Date(endDate) : existingEvent.endDate,
          startTime: startTime || existingEvent.startTime,
          isShowInHome: isShowInHome === "true",
          coverImage,
        },
      })
      .then((data) => {
        if (newCoverImage) deleteFile(existingEvent.coverImage);
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
