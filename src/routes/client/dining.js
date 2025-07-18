const express = require("express");
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /client/dining - Get dinings with optional filtering and meta
router.get('/', async (req, res) => {
  try {
    const { category, location, name, page = 1, limit = 10 } = req.query;
    const where = {};
    if (category) where.categoryId = parseInt(category);
    if (location) where.locationId = parseInt(location);
    if (name) where.name = { contains: name, mode: 'insensitive' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const dinings = await prisma.dining.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { category: true, location: true } });
    const total = await prisma.dining.count({ where });
    const publicDinings = dinings.map(({ id, name, category, location, imagePath }) => ({ id, name, category, location, imagePath }));
    res.json({ data: publicDinings, meta: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    console.error('Error fetching dinings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /client/dining/:id - Get single dining (public fields only)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dining = await prisma.dining.findUnique({ where: { id: parseInt(id) }, include: { category: true, location: true } });
    if (!dining) return res.status(404).json({ error: 'Dining not found' });
    const { name, category, location, imagePath } = dining;
    res.json({ id, name, category, location, imagePath });
  } catch (error) {
    console.error('Error fetching dining:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 