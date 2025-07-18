const prisma = require("../prisma");

// Get comprehensive dashboard statistics for events, stores, offices, users, brands, etc.
const getDashboardStats = async (req, res) => {
  try {
    // Use a single query to get all counts efficiently
    const [
      storesCount,
      eventsCount,
      officesCount,
      usersCount,
      brandsCount,
      categoriesCount,
      diningCount,
      promotionsCount,
      teamMembersCount,
      inquiriesCount,
      faqCount,
      faqCategoryCount
    ] = await Promise.all([
      prisma.store.count(),
      prisma.event.count(),
      prisma.office.count(),
      prisma.user.count(),
      prisma.brand.count(),
      prisma.category.count(),
      prisma.dining.count(),
      prisma.promotion.count(),
      prisma.teamMember.count(),
      prisma.contactInquiry.count(),
      prisma.FAQ.count(),
      prisma.FAQCategory.count()
    ]);

    // Get admin counts in a separate query to avoid complex joins
    const [adminsCount, superAdminsCount] = await Promise.all([
      prisma.user.count({ where: { role: { name: 'admin' } } }),
      prisma.user.count({ where: { role: { name: 'super_admin' } } })
    ]);

    // Get recent user registrations and inquiries
    const [recentUsers, recentInquiries] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, email: true, createdAt: true, role: true } }),
      prisma.contactInquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
    ]);

    // Get about info, facts and figures, our values
    const aboutInfo = await prisma.about.findFirst({
      include: {
        factsAndFigures: true,
        ourValues: true
      }
    });

    // Get detailed recent activities with full information
    const recentActivities = await Promise.all([
      prisma.store.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 5,
        include: { 
          category: true, 
          location: true 
        }
      }),
      prisma.event.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 5 
      }),
      prisma.office.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 5,
        include: { location: true }
      })
    ]);

    // Get featured stores (shown on homepage)
    const featuredStores = await prisma.store.findMany({
      where: { isShowInHome: true },
      include: { category: true, location: true },
      take: 5
    });

    // Get upcoming events (future events)
    const upcomingEvents = await prisma.event.findMany({
      where: {
        startDate: { gte: new Date() }
      },
      orderBy: { startDate: 'asc' },
      take: 5
    });

    // Get stores by category distribution
    const storesByCategory = await prisma.store.groupBy({
      by: ['categoryId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    // Get stores by location distribution
    const storesByLocation = await prisma.store.groupBy({
      by: ['locationId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    // Get category and location details for mapping
    const categories = await prisma.category.findMany({
      select: { id: true, categoryName: true }
    });
    const locations = await prisma.location.findMany({
      select: { id: true, level: true, type: true }
    });

    // Mock monthly data for charts (replace with real queries if needed)
    const monthlyStores = [
      { name: 'Jan', value: storesCount },
      { name: 'Feb', value: Math.floor(storesCount * 0.8) },
      { name: 'Mar', value: Math.floor(storesCount * 0.9) },
      { name: 'Apr', value: Math.floor(storesCount * 1.1) },
      { name: 'May', value: Math.floor(storesCount * 1.2) },
      { name: 'Jun', value: storesCount }
    ];
    const monthlyEvents = [
      { name: 'Jan', value: eventsCount },
      { name: 'Feb', value: Math.floor(eventsCount * 0.6) },
      { name: 'Mar', value: Math.floor(eventsCount * 0.8) },
      { name: 'Apr', value: Math.floor(eventsCount * 1.2) },
      { name: 'May', value: Math.floor(eventsCount * 1.4) },
      { name: 'Jun', value: eventsCount }
    ];
    const monthlyOffices = [
      { name: 'Jan', value: officesCount },
      { name: 'Feb', value: Math.floor(officesCount * 0.7) },
      { name: 'Mar', value: Math.floor(officesCount * 0.9) },
      { name: 'Apr', value: Math.floor(officesCount * 1.1) },
      { name: 'May', value: Math.floor(officesCount * 1.3) },
      { name: 'Jun', value: officesCount }
    ];

    // Mock growth percentages
    const storesGrowth = 12.5;
    const eventsGrowth = 8.3;
    const officesGrowth = 5.1;

    // Calculate total area for offices
    const totalOfficeArea = await prisma.office.aggregate({
      _sum: { area: true }
    });

    // Get event statistics
    const eventStats = await prisma.event.aggregate({
      _count: { id: true }
    });

    res.status(200).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: {
        counts: {
          stores: storesCount,
          events: eventsCount,
          offices: officesCount,
          users: usersCount,
          admins: adminsCount,
          superAdmins: superAdminsCount,
          brands: brandsCount,
          categories: categoriesCount,
          dining: diningCount,
          promotions: promotionsCount,
          teamMembers: teamMembersCount,
          inquiries: inquiriesCount,
          faqs: faqCount,
          faqCategories: faqCategoryCount
        },
        recent: {
          users: recentUsers,
          inquiries: recentInquiries
        },
        about: aboutInfo,
        growth: {
          stores: storesGrowth,
          events: eventsGrowth,
          offices: officesGrowth
        },
        recentActivities: {
          stores: recentActivities[0],
          events: recentActivities[1],
          offices: recentActivities[2]
        },
        charts: {
          monthlyStores,
          monthlyEvents,
          monthlyOffices
        },
        distributions: {
          storesByCategory: storesByCategory.map(item => {
            const category = categories.find(cat => cat.id === item.categoryId);
            return {
              name: category ? category.categoryName : 'Unknown Category',
              value: item._count.id
            };
          }),
          storesByLocation: storesByLocation.map(item => {
            const location = locations.find(loc => loc.id === item.locationId);
            return {
              name: location ? `Level ${location.level} - ${location.type}` : 'Unknown Location',
              value: item._count.id
            };
          })
        },
        featured: {
          stores: featuredStores,
          upcomingEvents: upcomingEvents
        },
        statistics: {
          totalOfficeArea: totalOfficeArea._sum.area || 0,
          averageEventDuration: eventStats._count.id || 0,
          featuredStoresCount: featuredStores.length,
          upcomingEventsCount: upcomingEvents.length
        }
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });
  }
};

const getDashboardData = getDashboardStats;

module.exports = {
  getDashboardStats,
  getDashboardData
}; 