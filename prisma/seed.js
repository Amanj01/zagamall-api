const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
    // ==================== AUTH SEEDER ====================

    // Create admin role if it doesn't exist
    let adminRole = await prisma.role.findFirst({ where: { name: 'admin' } });
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          name: 'admin',
        },
      });
    } else {
      // Admin role already exists
    }

    // Create admin user if it doesn't exist
    const adminEmail = 'admin@zagamall.com';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    let adminUser = await prisma.user.findFirst({ where: { email: adminEmail } });
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          name: 'Admin',
          email: adminEmail,
          password: hashedPassword,
          username: 'admin',
          role: { connect: { id: adminRole.id } },
        },
      });
    } else {
      // Admin user already exists
    }
    console.log('AUTH SEEDER: Seeded');
  } catch (e) {
    console.error('AUTH SEEDER: Error', e);
  }
  try {
    // ==================== LOCATIONS SEEDER ====================
    
    const locations = [
      { level: 1, number: 101, type: 'STORE', locationByDescription: 'Ground Floor - Main Entrance' },
      { level: 1, number: 102, type: 'STORE', locationByDescription: 'Ground Floor - Center' },
      { level: 1, number: 103, type: 'STORE', locationByDescription: 'Ground Floor - East Wing' },
      { level: 1, number: 104, type: 'DINING', locationByDescription: 'Ground Floor - Food Court' },
      { level: 2, number: 201, type: 'STORE', locationByDescription: 'First Floor - Fashion District' },
      { level: 2, number: 202, type: 'STORE', locationByDescription: 'First Floor - Electronics' },
      { level: 2, number: 203, type: 'OFFICE', locationByDescription: 'First Floor - Business Center' },
      { level: 3, number: 301, type: 'ENTERTAINMENT', locationByDescription: 'Second Floor - Entertainment Zone' },
      { level: 3, number: 302, type: 'DINING', locationByDescription: 'Second Floor - Fine Dining' },
    ];

    for (const locationData of locations) {
      const existingLocation = await prisma.location.findFirst({
        where: { level: locationData.level, number: locationData.number }
      });
      
      if (!existingLocation) {
        const createdLocation = await prisma.location.create({ data: locationData });
        console.log('Created location:', createdLocation);
      }
    }
    console.log('LOCATIONS SEEDER: Seeded');
  } catch (e) {
    console.error('LOCATIONS SEEDER: Error', e);
  }
  try {
    // ==================== CATEGORIES SEEDER ====================
    
    const categories = [
      'Fashion & Apparel',
      'Electronics & Technology',
      'Home & Lifestyle',
      'Beauty & Cosmetics',
      'Sports & Fitness',
      'Books & Stationery',
      'Jewelry & Accessories',
      'Food & Beverages',
      'Entertainment',
      'Services'
    ];

    for (const categoryName of categories) {
      const existingCategory = await prisma.category.findFirst({
        where: { categoryName }
      });
      
      if (!existingCategory) {
        const createdCategory = await prisma.category.create({ data: { categoryName } });
        console.log('Created category:', createdCategory);
      }
    }
    console.log('CATEGORIES SEEDER: Seeded');
  } catch (e) {
    console.error('CATEGORIES SEEDER: Error', e);
  }
  try {
    // ==================== DINING CATEGORIES SEEDER ====================
    
    const diningCategories = [
      { 
        name: 'Fast Food', 
        description: 'Quick and convenient dining options',
        imagePath: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
        features: [
          'Quick service',
          'Affordable prices',
          'Family-friendly',
          'Takeout available'
        ]
      },
      { 
        name: 'Fine Dining', 
        description: 'Upscale restaurants with premium cuisine',
        imagePath: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
        features: [
          'Premium service',
          'Gourmet cuisine',
          'Wine pairing',
          'Reservations recommended'
        ]
      },
      { 
        name: 'Cafes & Coffee', 
        description: 'Casual coffee shops and cafes',
        imagePath: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
        features: [
          'Specialty coffee',
          'Pastries & desserts',
          'WiFi available',
          'Relaxed atmosphere'
        ]
      },
      { 
        name: 'International Cuisine', 
        description: 'Diverse international food options',
        imagePath: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
        features: [
          'Global flavors',
          'Authentic recipes',
          'Cultural experience',
          'Diverse menu options'
        ]
      },
      { 
        name: 'Desserts & Sweets', 
        description: 'Sweet treats and dessert shops',
        imagePath: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop',
        features: [
          'Artisan desserts',
          'Custom cakes',
          'Ice cream varieties',
          'Sweet treats'
        ]
      }
    ];

    for (const categoryData of diningCategories) {
      const existingCategory = await prisma.diningCategory.findFirst({
        where: { name: categoryData.name }
      });
      
      if (!existingCategory) {
        const { features, ...categoryInfo } = categoryData;
        const createdCategory = await prisma.diningCategory.create({ 
          data: categoryInfo 
        });
        console.log('Created dining category:', createdCategory);
        
        // Create features for this category
        for (const featureText of features) {
          await prisma.diningCategoryFeature.create({
            data: {
              text: featureText,
              categoryId: createdCategory.id
            }
          });
        }
      }
    }
    console.log('DINING CATEGORIES SEEDER: Seeded');
  } catch (e) {
    console.error('DINING CATEGORIES SEEDER: Error', e);
  }
  try {
    // ==================== STORES SEEDER ====================
    
    const stores = [
      {
        name: 'Fashion Forward',
        categoryName: 'Fashion & Apparel',
        locationLevel: 2,
        locationNumber: 201,
        description: 'Trendy fashion store offering the latest styles for men and women',
        imagePath: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
        isShowInHome: true
      },
      {
        name: 'Tech Hub',
        categoryName: 'Electronics & Technology',
        locationLevel: 2,
        locationNumber: 202,
        description: 'Premium electronics store with the latest gadgets and devices',
        imagePath: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop',
        isShowInHome: true
      },
      {
        name: 'Home Essentials',
        categoryName: 'Home & Lifestyle',
        locationLevel: 1,
        locationNumber: 102,
        description: 'Everything you need to make your home beautiful and comfortable',
        imagePath: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        isShowInHome: false
      },
      {
        name: 'Beauty Paradise',
        categoryName: 'Beauty & Cosmetics',
        locationLevel: 1,
        locationNumber: 103,
        description: 'Premium beauty products and cosmetics for all your beauty needs',
        imagePath: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop',
        isShowInHome: true
      }
    ];

    for (const storeData of stores) {
      const category = await prisma.category.findFirst({
        where: { categoryName: storeData.categoryName }
      });
      
      const location = await prisma.location.findFirst({
        where: { level: storeData.locationLevel, number: storeData.locationNumber }
      });

      if (category && location) {
        const existingStore = await prisma.store.findFirst({
          where: { name: storeData.name }
        });
        
        if (!existingStore) {
          const createdStore = await prisma.store.create({
            data: {
              name: storeData.name,
              categoryId: category.id,
              locationId: location.id,
              description: storeData.description,
              imagePath: storeData.imagePath,
              isShowInHome: storeData.isShowInHome
            }
          });
          console.log('Created store:', createdStore);
        }
      }
    }
    console.log('STORES SEEDER: Seeded');
  } catch (e) {
    console.error('STORES SEEDER: Error', e);
  }
  try {
    // ==================== DINING SEEDER ====================
    
    const dinings = [
      {
        name: 'Pizza Palace',
        categoryName: 'Food & Beverages',
        diningCategoryName: 'Fast Food',
        locationLevel: 1,
        locationNumber: 104,
        description: 'Delicious pizzas and Italian cuisine with fresh ingredients and authentic recipes',
        hours: '10:00 AM - 10:00 PM',
        rating: 4.5,
        imagePath: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
        isShowInHome: true
      },
      {
        name: 'Gourmet Delight',
        categoryName: 'Food & Beverages',
        diningCategoryName: 'Fine Dining',
        locationLevel: 3,
        locationNumber: 302,
        description: 'Upscale dining experience with gourmet cuisine and exceptional service',
        hours: '6:00 PM - 11:00 PM',
        rating: 4.8,
        imagePath: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
        isShowInHome: true
      },
      {
        name: 'Coffee Corner',
        categoryName: 'Food & Beverages',
        diningCategoryName: 'Cafes & Coffee',
        locationLevel: 1,
        locationNumber: 101,
        description: 'Cozy coffee shop with premium coffee and fresh pastries',
        hours: '7:00 AM - 9:00 PM',
        rating: 4.3,
        imagePath: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
        isShowInHome: false
      },
      {
        name: 'Sushi Express',
        categoryName: 'Food & Beverages',
        diningCategoryName: 'International Cuisine',
        locationLevel: 1,
        locationNumber: 104,
        description: 'Fresh sushi and Japanese cuisine prepared by expert chefs',
        hours: '11:00 AM - 9:00 PM',
        rating: 4.6,
        imagePath: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
        isShowInHome: true
      },
      {
        name: 'Sweet Dreams',
        categoryName: 'Food & Beverages',
        diningCategoryName: 'Desserts & Sweets',
        locationLevel: 1,
        locationNumber: 103,
        description: 'Artisan desserts, custom cakes, and sweet treats for every occasion',
        hours: '9:00 AM - 8:00 PM',
        rating: 4.7,
        imagePath: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop',
        isShowInHome: true
      },
      {
        name: 'Burger House',
        categoryName: 'Food & Beverages',
        diningCategoryName: 'Fast Food',
        locationLevel: 1,
        locationNumber: 104,
        description: 'Juicy burgers, crispy fries, and classic American comfort food',
        hours: '11:00 AM - 10:00 PM',
        rating: 4.4,
        imagePath: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
        isShowInHome: false
      }
    ];

    for (const diningData of dinings) {
      const category = await prisma.category.findFirst({
        where: { categoryName: diningData.categoryName }
      });
      
      const diningCategory = await prisma.diningCategory.findFirst({
        where: { name: diningData.diningCategoryName }
      });
      
      const location = await prisma.location.findFirst({
        where: { level: diningData.locationLevel, number: diningData.locationNumber }
      });

      if (category && location) {
        const existingDining = await prisma.dining.findFirst({
          where: { name: diningData.name }
        });
        
        if (!existingDining) {
          const createdDining = await prisma.dining.create({
            data: {
              name: diningData.name,
              categoryId: category.id,
              locationId: location.id,
              description: diningData.description,
              hours: diningData.hours,
              rating: diningData.rating,
              imagePath: diningData.imagePath,
              isShowInHome: diningData.isShowInHome,
              diningCategoryId: diningCategory?.id
            }
          });
          console.log('Created dining:', createdDining);
        }
      }
    }
    console.log('DINING SEEDER: Seeded');
  } catch (e) {
    console.error('DINING SEEDER: Error', e);
  }
  try {
    // ==================== ENTERTAINMENT & SPORT SEEDER ====================
    
    const entertainmentAndSports = [
      {
        title: 'Premium Fitness Center',
        description: 'State-of-the-art fitness facility featuring cutting-edge cardio equipment, weight training, group classes, and recovery amenities. Perfect for all fitness enthusiasts.',
        area: 1200,
        locationLevel: 3,
        locationNumber: 301,
        category: 'SPORT',
        galleryImages: [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&h=600&fit=crop'
        ]
      },
      {
        title: 'Cinema Multiplex',
        description: 'Modern 8-screen cinema complex with premium recliner seating, Dolby Atmos sound, 4K projection, VIP rooms, and gourmet snacks. The best movie experience in town.',
        area: 2000,
        locationLevel: 3,
        locationNumber: 301,
        category: 'ENTERTAINMENT',
        galleryImages: [
          'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1517602302552-471fe67acf66?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1465101178521-c1a9136a3c91?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&h=600&fit=crop'
        ]
      }
    ];

    for (const entertainmentData of entertainmentAndSports) {
      const location = await prisma.location.findFirst({
        where: { level: entertainmentData.locationLevel, number: entertainmentData.locationNumber }
      });

      if (location) {
        // Skip checking for existing records due to enum issues
        const { galleryImages, ...entertainmentInfo } = entertainmentData;
        const createdEntertainment = await prisma.entertainmentAndSport.create({
          data: {
            title: entertainmentData.title,
            description: entertainmentData.description,
            area: entertainmentData.area,
            locationId: location.id,
            category: entertainmentData.category || 'ENTERTAINMENT'
          }
        });
        console.log('Created entertainment:', createdEntertainment);
        
        // Create gallery images for this entertainment
        for (const imagePath of galleryImages) {
          await prisma.entertainmentAndSportGallery.create({
            data: {
              imagePath: imagePath,
              entertainmentAndSportId: createdEntertainment.id
            }
          });
        }
      }
    }

    // ==================== EVENTS SEEDER ====================
    
    const events = [
      {
        title: 'Summer Fashion Show',
        content: 'Join us for an exciting fashion show featuring the latest summer trends from our top retailers. Experience runway shows, styling sessions, and exclusive shopping opportunities.',
        coverImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=600&fit=crop',
        startDate: new Date('2024-07-15T18:00:00Z'),
        endDate: new Date('2024-07-15T21:00:00Z'),
        startTime: '6:00 PM',
        location: 'Main Atrium',
        isShowInHome: true
      },
      {
        title: 'Tech Expo 2024',
        content: 'Discover the latest technology trends and innovations at our annual tech expo. Meet tech experts, try new gadgets, and learn about the future of technology.',
        coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
        startDate: new Date('2024-08-20T10:00:00Z'),
        endDate: new Date('2024-08-22T18:00:00Z'),
        startTime: '10:00 AM',
        location: 'Exhibition Hall',
        isShowInHome: true
      },
      {
        title: 'Food Festival',
        content: 'Taste cuisines from around the world at our annual food festival featuring local and international chefs. Enjoy live cooking demonstrations, food tastings, and culinary competitions.',
        coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
        startDate: new Date('2024-09-10T12:00:00Z'),
        endDate: new Date('2024-09-12T22:00:00Z'),
        startTime: '12:00 PM',
        location: 'Food Court & Outdoor Plaza',
        isShowInHome: false
      },

      {
        title: 'Kids Entertainment Day',
        content: 'A day full of fun activities for children including face painting, balloon art, magic shows, and interactive games. Free admission for all families.',
        coverImage: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
        startDate: new Date('2024-10-05T11:00:00Z'),
        endDate: new Date('2024-10-05T17:00:00Z'),
        startTime: '11:00 AM',
        location: 'Entertainment Zone',
        isShowInHome: false
      }
    ];

    for (const eventData of events) {
      const existingEvent = await prisma.event.findFirst({
        where: { title: eventData.title }
      });
      
      if (!existingEvent) {
        const createdEvent = await prisma.event.create({ data: eventData });
        console.log('Created event:', createdEvent);
      }
    }
    console.log('EVENTS SEEDER: Seeded');
  } catch (e) {
    console.error('EVENTS SEEDER: Error', e);
  }
  try {
    // ==================== CURRENT PROMOTIONS SEEDER ====================
    
    const currentPromotions = [
      {
        title: 'Summer Sale - Up to 70% Off',
        description: 'Beat the heat with cool summer discounts across selected fashion stores.',
        participatingStores: 'Fashion Forward, Beauty Paradise, Home Essentials',
        date: new Date('2024-07-01T00:00:00Z'),
        endDate: new Date('2024-07-31T23:59:59Z')
      },
      {
        title: 'Back to School Discounts',
        description: 'Get ready for the new school year with special discounts on supplies and clothing.',
        participatingStores: 'Tech Hub, Fashion Forward, Books & More',
        date: new Date('2024-08-01T00:00:00Z'),
        endDate: new Date('2024-08-25T23:59:59Z')
      },
      {
        title: 'Dining Rewards Program',
        description: 'Earn points every time you dine at our food establishments. Redeem for free meals and discounts.',
        participatingStores: 'All restaurants and cafés',
        date: new Date('2024-06-01T00:00:00Z'),
        endDate: null
      }
    ];

    for (const promotionData of currentPromotions) {
      const existingPromotion = await prisma.currentPromotion.findFirst({
        where: { title: promotionData.title }
      });
      
      if (!existingPromotion) {
        const createdPromotion = await prisma.currentPromotion.create({ data: promotionData });
        console.log('Created current promotion:', createdPromotion);
      }
    }
  } catch (e) {
    console.error('CURRENT PROMOTIONS SEEDER: Error', e);
  }
  try {
    // ==================== BRANDS SEEDER ====================
    
    const brands = [
      {
        name: 'Nike',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop',
        isShowInHome: true
      },
      {
        name: 'Apple',
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=600&fit=crop',
        isShowInHome: true
      },
      {
        name: 'Samsung',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=600&fit=crop',
        isShowInHome: true
      },
      {
        name: 'Adidas',
        image: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=800&h=600&fit=crop',
        isShowInHome: false
      }
    ];

    for (const brandData of brands) {
      const existingBrand = await prisma.brand.findFirst({
        where: { name: brandData.name }
      });
      
      if (!existingBrand) {
        const createdBrand = await prisma.brand.create({ data: brandData });
        console.log('Created brand:', createdBrand);
      }
    }
    console.log('BRANDS SEEDER: Seeded');
  } catch (e) {
    console.error('BRANDS SEEDER: Error', e);
  }
  try {
    // ==================== OFFICES SEEDER ====================
    
    const offices = [
      {
        title: 'Executive Suite A',
        locationLevel: 2,
        locationNumber: 203,
        description: 'Premium office space with modern amenities, panoramic city views, private meeting rooms, executive lounge, and 24/7 access. Perfect for established businesses and corporate headquarters.',
        area: 150,
        imagePath: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
        isShowInHome: true,
        features: [
          'Modern office space with premium amenities',
          'High-speed internet and WiFi connectivity',
          '24/7 building access and security',
          'Central air conditioning and heating',
          'Professional reception and mail services',
          'Meeting rooms and conference facilities',
          'Parking spaces for tenants',
          'Prime location in Zaga Mall'
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop'
        ]
      },
      {
        title: 'Business Center B',
        locationLevel: 2,
        locationNumber: 203,
        description: 'Flexible office space perfect for startups and small businesses. Features shared meeting rooms, reception services, high-speed internet, and flexible lease terms.',
        area: 80,
        imagePath: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
        isShowInHome: false,
        features: [
          'Flexible office space for startups',
          'Shared meeting rooms available',
          'Reception services included',
          'High-speed internet access',
          'Flexible lease terms',
          'Business support services',
          'Networking opportunities',
          'Cost-effective solutions'
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
        ]
      },
      {
        title: 'Innovation Hub',
        locationLevel: 2,
        locationNumber: 203,
        description: 'Collaborative workspace designed for creative teams and tech startups. Features open-plan layouts, brainstorming areas, presentation rooms, and networking events.',
        area: 200,
        imagePath: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
        isShowInHome: true,
        features: [
          'Collaborative workspace design',
          'Open-plan layouts',
          'Brainstorming areas',
          'Presentation rooms',
          'Networking events',
          'Creative environment',
          'Tech-friendly facilities',
          'Innovation-focused community'
        ],
        galleryImages: [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop'
        ]
      }
    ];

    for (const officeData of offices) {
      const location = await prisma.location.findFirst({
        where: { level: officeData.locationLevel, number: officeData.locationNumber }
      });

      if (location) {
        const existingOffice = await prisma.office.findFirst({
          where: { title: officeData.title }
        });
        
        if (!existingOffice) {
          const { galleryImages, features, ...officeInfo } = officeData;
          const createdOffice = await prisma.office.create({
            data: {
              title: officeData.title,
              locationId: location.id,
              description: officeData.description,
              area: officeData.area,
              image: officeData.imagePath,
              isShowInHome: officeData.isShowInHome
            }
          });
          console.log('Created office:', createdOffice);
          
          // Create features for this office
          if (features && Array.isArray(features)) {
            for (const featureText of features) {
              await prisma.officeFeature.create({
                data: {
                  text: featureText,
                  officeId: createdOffice.id
                }
              });
            }
          }
          
          // Create gallery images for this office
          for (const imagePath of galleryImages) {
            await prisma.officeGallery.create({
              data: {
                imagePath: imagePath,
                officeId: createdOffice.id
              }
            });
          }
        }
      }
    }
    console.log('OFFICES SEEDER: Seeded');
  } catch (e) {
    console.error('OFFICES SEEDER: Error', e);
  }
  try {
    // ==================== POSITIONS SEEDER ====================
    
    const positions = [
      'CEO',
      'Marketing Manager',
      'Operations Director',
      'Customer Service Manager',
      'IT Specialist'
    ];

    for (const positionName of positions) {
      const existingPosition = await prisma.position.findFirst({
        where: { name: positionName }
      });
      
      if (!existingPosition) {
        const createdPosition = await prisma.position.create({ data: { name: positionName } });
        console.log('Created position:', createdPosition);
      }
    }
  } catch (e) {
    console.error('POSITIONS SEEDER: Error', e);
  }
  try {
    // ==================== TEAM MEMBERS SEEDER ====================
    
    const teamMembers = [
      {
        name: 'John Smith',
        bio: 'Experienced CEO with over 15 years in retail management',
        positionName: 'CEO',
        imagePath: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=600&fit=crop'
      },
      {
        name: 'Sarah Johnson',
        bio: 'Creative marketing professional with expertise in digital campaigns',
        positionName: 'Marketing Manager',
        imagePath: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=800&h=600&fit=crop'
      },
      {
        name: 'Michael Brown',
        bio: 'Operations expert focused on efficiency and customer satisfaction',
        positionName: 'Operations Director',
        imagePath: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'
      }
    ];

    for (const memberData of teamMembers) {
      const position = await prisma.position.findFirst({
        where: { name: memberData.positionName }
      });

      if (position) {
        const existingMember = await prisma.teamMember.findFirst({
          where: { name: memberData.name }
        });
        
        if (!existingMember) {
          const createdMember = await prisma.teamMember.create({
            data: {
              name: memberData.name,
              bio: memberData.bio,
              imagePath: memberData.imagePath,
              positionId: position.id
            }
          });
          console.log('Created team member:', createdMember);
        }
      }
    }
  } catch (e) {
    console.error('TEAM MEMBERS SEEDER: Error', e);
  }
  try {
    // ==================== FAQ CATEGORIES SEEDER ====================
    
    const faqCategories = [
      { name: 'General Information', description: 'General questions about the mall', orderNumber: 1 },
      { name: 'Shopping', description: 'Questions about shopping and stores', orderNumber: 2 },
      { name: 'Dining', description: 'Questions about restaurants and food', orderNumber: 3 },
      { name: 'Events', description: 'Questions about events and promotions', orderNumber: 4 },
      { name: 'Services', description: 'Questions about mall services', orderNumber: 5 }
    ];

    for (const categoryData of faqCategories) {
      const existingCategory = await prisma.fAQCategory.findFirst({
        where: { name: categoryData.name }
      });
      
      if (!existingCategory) {
        const createdCategory = await prisma.fAQCategory.create({ data: categoryData });
        console.log('Created FAQ category:', createdCategory);
      }
    }
  } catch (e) {
    console.error('FAQ CATEGORIES SEEDER: Error', e);
  }
  try {
    // ==================== FAQS SEEDER ====================
    
    const faqs = [
      {
        question: 'What are the mall opening hours?',
        answer: 'The mall is open from 10:00 AM to 10:00 PM daily, including weekends and holidays.',
        category: 'General Information',
        orderNumber: 1
      },
      {
        question: 'Is there parking available?',
        answer: 'Yes, we have free parking available for all visitors with over 500 parking spaces.',
        category: 'General Information',
        orderNumber: 2
      },
      {
        question: 'Do you have WiFi?',
        answer: 'Yes, free WiFi is available throughout the mall. Connect to "ZagaMall-Free" network.',
        category: 'Services',
        orderNumber: 1
      },
      {
        question: 'Are there any restaurants in the mall?',
        answer: 'Yes, we have a variety of restaurants and cafes offering different cuisines from fast food to fine dining.',
        category: 'Dining',
        orderNumber: 1
      },
      {
        question: 'Can I return items purchased from stores?',
        answer: 'Return policies vary by store. Please check with individual stores for their specific return policies.',
        category: 'Shopping',
        orderNumber: 1
      }
    ];

    for (const faqData of faqs) {
      const existingFAQ = await prisma.fAQ.findFirst({
        where: { question: faqData.question }
      });
      
      if (!existingFAQ) {
        const createdFAQ = await prisma.fAQ.create({ data: faqData });
        console.log('Created FAQ:', createdFAQ);
      }
    }
  } catch (e) {
    console.error('FAQS SEEDER: Error', e);
  }
  try {
    // ==================== PROMOTIONS SEEDER ====================
    
    const promotions = [
      {
        title: 'Summer Sale - Up to 70% Off',
        period: 'July 1-31, 2024',
        description: 'Beat the heat with cool summer discounts across selected fashion stores.',
        imagePath: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
        isShowInHome: true
      },
      {
        title: 'Back to School Discounts',
        period: 'August 1-25, 2024',
        description: 'Get ready for the new school year with special discounts on supplies and clothing.',
        imagePath: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop',
        isShowInHome: true
      },
      {
        title: 'Dining Rewards Program',
        period: 'Ongoing',
        description: 'Earn points every time you dine at our food establishments. Redeem for free meals and discounts.',
        imagePath: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
        isShowInHome: false
      }
    ];

    for (const promotionData of promotions) {
      const existingPromotion = await prisma.promotion.findFirst({
        where: { title: promotionData.title }
      });
      
      if (!existingPromotion) {
        const createdPromotion = await prisma.promotion.create({ data: promotionData });
        console.log('Created promotion:', createdPromotion);
      }
    }
  } catch (e) {
    console.error('PROMOTIONS SEEDER: Error', e);
  }
  try {
    // ==================== HERO SECTIONS SEEDER ====================
    
    const heroSections = [
      {
        title: 'Welcome to Zaga Mall',
        description: 'Your premier shopping and entertainment destination in the heart of the city',
        imagePath: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
        orderNumber: 1
      },
      {
        title: 'Discover Amazing Deals',
        description: 'Find the best prices on fashion, electronics, and more',
        imagePath: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop',
        orderNumber: 2
      },
      {
        title: 'Experience Entertainment',
        description: 'From movies to fitness, we have everything for your entertainment needs',
        imagePath: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
        orderNumber: 3
      }
    ];

    for (const heroData of heroSections) {
      const existingHero = await prisma.heroSection.findFirst({
        where: { title: heroData.title }
      });
      
      if (!existingHero) {
        const createdHero = await prisma.heroSection.create({ data: heroData });
        console.log('Created hero section:', createdHero);
      }
    }
  } catch (e) {
    console.error('HERO SECTIONS SEEDER: Error', e);
  }
  try {
    // ==================== ABOUT SEEDER ====================
    
    const aboutData = {
      title: 'About Zaga Mall',
      description: 'Zaga Mall is the premier shopping and entertainment destination in the region, offering a unique blend of retail, dining, and entertainment experiences.',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
      factsAndFigures: [
        { number: '200+', description: 'Stores and Restaurants' },
        { number: '50,000+', description: 'Daily Visitors' },
        { number: '500+', description: 'Parking Spaces' },
        { number: '24/7', description: 'Security Service' }
      ],
      ourValues: [
        { title: 'Excellence', description: 'We strive for excellence in everything we do' },
        { title: 'Innovation', description: 'Constantly innovating to provide better experiences' },
        { title: 'Community', description: 'Building strong relationships with our community' },
        { title: 'Sustainability', description: 'Committed to environmental responsibility' }
      ]
    };

    const existingAbout = await prisma.about.findFirst();
    if (!existingAbout) {
      const createdAbout = await prisma.about.create({
        data: {
          title: aboutData.title,
          description: aboutData.description,
          image: aboutData.image
        }
      });

      // Create facts and figures
      for (const factData of aboutData.factsAndFigures) {
        await prisma.factAndFigure.create({
          data: {
            number: factData.number,
            description: factData.description,
            aboutId: createdAbout.id
          }
        });
      }

      // Create our values
      for (const valueData of aboutData.ourValues) {
        await prisma.ourValue.create({
          data: {
            title: valueData.title,
            description: valueData.description,
            aboutId: createdAbout.id
          }
        });
      }
    }
  } catch (e) {
    console.error('ABOUT SEEDER: Error', e);
  }
  try {
    // ==================== HOME SETTINGS SEEDER ====================
    
    const homeSettings = {
      quickInfoTitle: 'Quick Information',
      quickInfoContent: 'Zaga Mall is open daily from 10:00 AM to 10:00 PM. Free parking available. WiFi throughout the mall.'
    };

    const existingHomeSetting = await prisma.homeSetting.findFirst();
    if (!existingHomeSetting) {
      const createdHomeSetting = await prisma.homeSetting.create({ data: homeSettings });
      console.log('Created home setting:', createdHomeSetting);
    }
    console.log('HOME SETTINGS SEEDER: Seeded');
  } catch (e) {
    console.error('HOME SETTINGS SEEDER: Error', e);
  }
  try {
    // ==================== PARKING SEEDER ====================
    
    const parkingData = {
      title: 'Mall Parking',
      description: 'Convenient parking with over 500 spaces available for visitors. Free parking for all mall customers.',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
    };

    const existingParking = await prisma.parking.findFirst();
    if (!existingParking) {
      const createdParking = await prisma.parking.create({ data: parkingData });
      console.log('Created parking:', createdParking);
    }
  } catch (e) {
    console.error('PARKING SEEDER: Error', e);
  }
  try {
    // ==================== ITEMS SEEDER ====================
    
    const items = [
      {
        name: 'Nike Air Max',
        description: 'Premium athletic shoes for maximum comfort and performance',
        cardImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop',
        showOnHomepage: true,
        brandName: 'Nike'
      },
      {
        name: 'iPhone 15 Pro',
        description: 'Latest smartphone with advanced features and premium design',
        cardImage: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=600&fit=crop',
        showOnHomepage: true,
        brandName: 'Apple'
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Flagship Android smartphone with cutting-edge technology',
        cardImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=600&fit=crop',
        showOnHomepage: false,
        brandName: 'Samsung'
      }
    ];

    for (const itemData of items) {
      const brand = await prisma.brand.findFirst({ where: { name: itemData.brandName } });
      if (brand) {
        const existingItem = await prisma.item.findFirst({ where: { name: itemData.name } });
        if (!existingItem) {
          // Remove brandName from itemData before creating
          const { brandName, ...itemInfo } = itemData;
          const createdItem = await prisma.item.create({
            data: {
              ...itemInfo,
              brandId: brand.id
            }
          });
          console.log('Created item:', createdItem);
        }
      }
    }
  } catch (e) {
    console.error('ITEMS SEEDER: Error', e);
  }
  try {
    // ==================== RESOURCES SEEDER ====================
    
    const resources = [
      {
        title: 'Mall Directory',
        description: 'Complete guide to all stores and services in Zaga Mall',
        filePath: '/resources/mall-directory.pdf',
        fileType: 'PDF'
      },
      {
        title: 'Parking Guide',
        description: 'Information about parking locations and rates',
        filePath: '/resources/parking-guide.pdf',
        fileType: 'PDF'
      }
    ];

    for (const resourceData of resources) {
      const existingResource = await prisma.resource.findFirst({
        where: { title: resourceData.title }
      });
      
      if (!existingResource) {
        const createdResource = await prisma.resource.create({ data: resourceData });
        console.log('Created resource:', createdResource);
      }
    }
  } catch (e) {
    console.error('RESOURCES SEEDER: Error', e);
  }

}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });