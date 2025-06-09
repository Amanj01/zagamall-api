const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/store - Get stores with optional filtering
router.get('/', async (req, res) => {
  try {
    const {
      category,
      location,
      isShowInHome,
      name,
      page = 1,
      limit = 10
    } = req.query;

    // Build where clause dynamically
    const where = {};

    // Filter by category name
    if (category) {
      where.category = {
        categoryName: {
          contains: category,
          mode: 'insensitive'
        }
      };
    }

    // Filter by location level
    if (location) {
      where.location = {
        level: {
          contains: location,
          mode: 'insensitive'
        }
      };
    }

    // Filter by home display status
    if (isShowInHome !== undefined) {
      where.isShowInHome = isShowInHome === 'true';
    }

    // Filter by store name
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive'
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get stores with filters and include related data
    const stores = await prisma.store.findMany({
      where,
      include: {
        category: true,
        location: true
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get total count for pagination
    const total = await prisma.store.count({ where });

    res.json({
      stores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/store/:id - Get single store
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const store = await prisma.store.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        location: true
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
