const express = require("express");
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /client/event - Get events with optional filtering and meta
router.get('/', async (req, res) => {
  try {
    const { title, search, isShowInHome, page = 1, limit = 10 } = req.query;
    const where = {};
    
    // Support both 'title' and 'search' parameters for backward compatibility
    const searchTerm = search || title;
    if (searchTerm) where.title = { contains: searchTerm, mode: 'insensitive' };
    if (isShowInHome !== undefined) where.isShowInHome = isShowInHome === 'true' || isShowInHome === true;
    
    console.log('Event API - Query params:', { title, search, isShowInHome, page, limit });
    console.log('Event API - Where clause:', where);
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const events = await prisma.event.findMany({ 
      where, 
      skip, 
      take, 
      orderBy: { createdAt: 'desc' } 
    });
    const total = await prisma.event.count({ where });
    
    console.log('Event API - Found events:', events.length);
    console.log('Event API - Total events:', total);
    
    // Return all public fields from the Event model
    const publicEvents = events.map(({ id, title, content, coverImage, startDate, endDate, startTime, location, isShowInHome }) => ({
      id,
      title,
      content,
      coverImage,
      startDate,
      endDate,
      startTime,
      location,
      isShowInHome
    }));
    
    const responseData = {
      data: publicEvents,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
    
    console.log('Event API - Response data:', JSON.stringify(responseData, null, 2));
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /client/event/:id - Get single event (public fields only)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Return all public fields from the Event model
    const { title, content, coverImage, startDate, endDate, startTime, location, isShowInHome } = event;
    res.json({ 
      id: event.id, 
      title, 
      content, 
      coverImage, 
      startDate, 
      endDate, 
      startTime, 
      location, 
      isShowInHome 
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 