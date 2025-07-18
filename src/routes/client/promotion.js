const express = require("express");
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /client/promotion - Get current promotions with optional filtering and meta
router.get('/', async (req, res) => {
  try {
    const { title, search, page = 1, limit = 10 } = req.query;
    const where = {};
    // Support both 'title' and 'search' parameters for backward compatibility
    const searchTerm = search || title;
    if (searchTerm) where.title = { contains: searchTerm, mode: 'insensitive' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const promotions = await prisma.currentPromotion.findMany({ 
      where, 
      skip, 
      take, 
      orderBy: { date: 'desc' }
    });
    const total = await prisma.currentPromotion.count({ where });
    const publicPromotions = promotions.map(({ id, title, description, participatingStores, date, endDate }) => ({
      id,
      title,
      description,
      participatingStores,
      date,
      endDate
    }));
    const responseData = {
      data: publicPromotions,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching current promotions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /client/promotion/:id - Get single current promotion (public fields only)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await prisma.currentPromotion.findUnique({
      where: { id: parseInt(id) }
    });
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    const { title, description, participatingStores, date, endDate } = promotion;
    res.json({ 
      id: promotion.id, 
      title, 
      description, 
      participatingStores,
      date,
      endDate
    });
  } catch (error) {
    console.error('Error fetching current promotion:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 