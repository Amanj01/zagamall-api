const prisma = require("../prisma");
const { deleteFile, deleteCloudinaryImage } = require("../utils/utility");

// Get all events with pagination, search, and meta
const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause for search
    const whereClause = {};
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build order by clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination
    const totalCount = await prisma.event.count({
      where: whereClause
    });

    // Get events with pagination
    const events = await prisma.event.findMany({
      where: whereClause,
      orderBy: orderBy,
      skip: skip,
      take: pageSize,
    });

    // Calculate pagination meta
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPreviousPage = pageNumber > 1;

    // Build meta information
    const meta = {
      currentPage: pageNumber,
      totalPages,
      totalCount,
      pageSize,
      hasNextPage,
      hasPreviousPage,
      nextPage: hasNextPage ? pageNumber + 1 : null,
      previousPage: hasPreviousPage ? pageNumber - 1 : null
    };

    // Build links for HATEOAS
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const links = {
      self: `${baseUrl}?page=${pageNumber}&limit=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      first: `${baseUrl}?page=1&limit=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      last: `${baseUrl}?page=${totalPages}&limit=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      next: hasNextPage ? `${baseUrl}?page=${pageNumber + 1}&limit=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}` : null,
      prev: hasPreviousPage ? `${baseUrl}?page=${pageNumber - 1}&limit=${pageSize}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}` : null
    };

    res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      data: events,
      meta,
      links
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message
    });
  }
};

// Get single event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const eventId = parseInt(id);

    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID"
      });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Event retrieved successfully",
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: error.message
    });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    const { title, content, coverImage, startDate, endDate, startTime, location, isShowInHome } = req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Title is required and cannot be empty"
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: "Start date is required"
      });
    }

    if (!endDate) {
      return res.status(400).json({
        success: false,
        message: "End date is required"
      });
    }

    if (!startTime) {
      return res.status(400).json({
        success: false,
        message: "Start time is required"
      });
    }

    if (!coverImage) {
      return res.status(400).json({
        success: false,
        message: "Cover image is required"
      });
    }

    if (title.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 255 characters"
      });
    }

    if (content && content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Content cannot exceed 2000 characters"
      });
    }

    // Validate dates
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    if (isNaN(startDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date format"
      });
    }

    if (isNaN(endDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid end date format"
      });
    }

    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    // Check if title already exists
    const existingEventWithTitle = await prisma.event.findFirst({
      where: { title: { equals: title.trim(), mode: 'insensitive' } }
    });

    if (existingEventWithTitle) {
      return res.status(409).json({
        success: false,
        message: "An event with this title already exists"
      });
    }

    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        content: content ? content.trim() : "",
        startDate: startDateTime,
        endDate: endDateTime,
        startTime: String(startTime),
        location: typeof location === 'string' ? location : '',
        isShowInHome: isShowInHome === "true" || isShowInHome === true,
        coverImage,
      },
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event
    });
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "An event with this title already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error.message
    });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventId = parseInt(id);
    const { title, content, coverImage, startDate, endDate, startTime, location, isShowInHome } = req.body;

    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID"
      });
    }

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    // Validation
    if (title !== undefined && (!title || title.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Title is required and cannot be empty"
      });
    }

    if (title && title.length > 255) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 255 characters"
      });
    }

    if (content && content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Content cannot exceed 2000 characters"
      });
    }

    // Validate dates if provided
    let startDateTime = existingEvent.startDate;
    let endDateTime = existingEvent.endDate;

    if (startDate) {
      startDateTime = new Date(startDate);
      if (isNaN(startDateTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start date format"
        });
      }
    }

    if (endDate) {
      endDateTime = new Date(endDate);
      if (isNaN(endDateTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid end date format"
        });
      }
    }

    if (startDate || endDate) {
      if (endDateTime <= startDateTime) {
        return res.status(400).json({
          success: false,
          message: "End date must be after start date"
        });
      }
    }

    // Check if title already exists (if being updated)
    if (title && title.trim() !== existingEvent.title) {
      const existingEventWithTitle = await prisma.event.findFirst({
        where: { 
          title: { equals: title.trim(), mode: 'insensitive' },
          id: { not: eventId }
        }
      });

      if (existingEventWithTitle) {
        return res.status(409).json({
          success: false,
          message: "An event with this title already exists"
        });
      }
    }

    // Handle image update
    let finalCoverImage = existingEvent.coverImage;
    if (coverImage && coverImage !== existingEvent.coverImage) {
      // Delete old image from Cloudinary if it exists and is different
      if (existingEvent.coverImage) {
        await deleteCloudinaryImage(existingEvent.coverImage);
      }
      finalCoverImage = coverImage;
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: title ? title.trim() : existingEvent.title,
        content: content !== undefined ? content.trim() : existingEvent.content,
        startDate: startDateTime,
        endDate: endDateTime,
        startTime: startTime || existingEvent.startTime,
        location: typeof location === 'string' ? location : existingEvent.location || '',
        isShowInHome: isShowInHome !== undefined ? (isShowInHome === "true" || isShowInHome === true) : existingEvent.isShowInHome,
        coverImage: finalCoverImage,
      }
    });

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent
    });
  } catch (error) {
    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: "An event with this title already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message
    });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventId = parseInt(id);

    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    // Fetch the event first (to get coverImage and check existence)
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!existingEvent) {
      // If already deleted, return success (idempotent)
      return res.status(200).json({
        success: true,
        message: "Event already deleted",
        data: null
      });
    }

    // Delete the Cloudinary image if it exists
    if (existingEvent.coverImage) {
      await deleteCloudinaryImage(existingEvent.coverImage);
    }

    // Now delete from database
    try {
      await prisma.event.delete({
        where: { id: eventId }
      });
    } catch (error) {
      // Handle P2025 error (record not found)
      if (error.code === 'P2025') {
        // Record already deleted, treat as success (idempotent)
        return res.status(200).json({
          success: true,
          message: "Event already deleted",
          data: null
        });
      }
      // Other errors should be thrown to the outer catch
      throw error;
    }

    // Do not fetch the event after deletion
    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: error.message
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
