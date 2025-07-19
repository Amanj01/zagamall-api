const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seeder...');

  // ==================== AUTH SEEDER ====================
  console.log('🔐 Creating auth data...');

  // Create admin role if it doesn't exist
  let adminRole = await prisma.role.findFirst({ where: { name: 'admin' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'admin',
      },
    });
    console.log('✅ Created admin role');
  } else {
    console.log('ℹ️ Admin role already exists');
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
    console.log('✅ Created admin user:', adminEmail);
    console.log('🔑 Password:', adminPassword);
  } else {
    console.log('ℹ️ Admin user already exists:', adminEmail);
  }

  // ==================== LOCATIONS SEEDER ====================
  console.log('📍 Creating locations...');
  
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
      await prisma.location.create({ data: locationData });
      console.log(`✅ Created location: Level ${locationData.level}, Number ${locationData.number}`);
    }
  }

  // ==================== CATEGORIES SEEDER ====================
  console.log('🏷️ Creating categories...');
  
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
      await prisma.category.create({ data: { categoryName } });
      console.log(`✅ Created category: ${categoryName}`);
    }
  }

  // ==================== DINING CATEGORIES SEEDER ====================
  console.log('🍽️ Creating dining categories...');
  
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
      
      // Create features for this category
      for (const featureText of features) {
        await prisma.diningCategoryFeature.create({
          data: {
            text: featureText,
            categoryId: createdCategory.id
          }
        });
      }
      
      console.log(`✅ Created dining category: ${categoryData.name} with ${features.length} features`);
    }
  }

  // ==================== STORES SEEDER ====================
  console.log('🏪 Creating stores...');
  
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
        await prisma.store.create({
          data: {
            name: storeData.name,
            categoryId: category.id,
            locationId: location.id,
            description: storeData.description,
            imagePath: storeData.imagePath,
            isShowInHome: storeData.isShowInHome
          }
        });
        console.log(`✅ Created store: ${storeData.name}`);
      }
    }
  }

  // ==================== DINING SEEDER ====================
  console.log('🍕 Creating dining establishments...');
  
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
        await prisma.dining.create({
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
        console.log(`✅ Created dining: ${diningData.name}`);
      }
    }
  }

  // ==================== ENTERTAINMENT & SPORT SEEDER ====================
  console.log('🎮 Creating entertainment and sport facilities...');
  
  const entertainmentAndSports = [
    {
      title: 'Premium Fitness Center',
      description: 'State-of-the-art fitness facility featuring cutting-edge cardio equipment, weight training, group classes, and recovery amenities. Perfect for all fitness enthusiasts.',
      area: 1200,
      locationLevel: 3,
      locationNumber: 301,
      category: 'SPORT',
      galleryImages: [
        'https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?w=800&h=600&fit=crop'
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
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1517602302552-471fe67acf66?w=800&h=600&fit=crop'
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
      
      // Create gallery images for this entertainment
      for (const imagePath of galleryImages) {
        await prisma.entertainmentAndSportGallery.create({
          data: {
            imagePath: imagePath,
            entertainmentAndSportId: createdEntertainment.id
          }
        });
      }
      
      console.log(`✅ Created entertainment: ${entertainmentData.title} with ${galleryImages.length} gallery images`);
    }
  }

  // ==================== EVENTS SEEDER ====================
  console.log('🎉 Creating events...');
  
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
      await prisma.event.create({ data: eventData });
      console.log(`✅ Created event: ${eventData.title}`);
    }
  }

  // ==================== CURRENT PROMOTIONS SEEDER ====================
  console.log('🎯 Creating current promotions...');
  
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
      await prisma.currentPromotion.create({ data: promotionData });
      console.log(`✅ Created current promotion: ${promotionData.title}`);
    }
  }

  // ==================== BRANDS SEEDER ====================
  console.log('🏷️ Creating brands...');
  
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
      await prisma.brand.create({ data: brandData });
      console.log(`✅ Created brand: ${brandData.name}`);
    }
  }

  // ==================== OFFICES SEEDER ====================
  console.log('🏢 Creating offices...');
  
  const offices = [
    {
      title: 'Executive Suite A',
      locationLevel: 2,
      locationNumber: 203,
      description: 'Premium office space with modern amenities, panoramic city views, private meeting rooms, executive lounge, and 24/7 access. Perfect for established businesses and corporate headquarters.',
      area: 150,
      imagePath: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      isShowInHome: true,
      galleryImages: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
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
      galleryImages: [
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop'
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
      galleryImages: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
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
        const { galleryImages, ...officeInfo } = officeData;
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
        
        // Create gallery images for this office
        for (const imagePath of galleryImages) {
          await prisma.officeGallery.create({
            data: {
              imagePath: imagePath,
              officeId: createdOffice.id
            }
          });
        }
        
        console.log(`✅ Created office: ${officeData.title} with ${galleryImages.length} gallery images`);
      }
    }
  }

  // ==================== POSITIONS SEEDER ====================
  console.log('👥 Creating positions...');
  
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
      await prisma.position.create({ data: { name: positionName } });
      console.log(`✅ Created position: ${positionName}`);
    }
  }

  // ==================== TEAM MEMBERS SEEDER ====================
  console.log('👨‍💼 Creating team members...');
  
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
        await prisma.teamMember.create({
          data: {
            name: memberData.name,
            bio: memberData.bio,
            imagePath: memberData.imagePath,
            positionId: position.id
          }
        });
        console.log(`✅ Created team member: ${memberData.name}`);
      }
    }
  }

  // ==================== FAQ CATEGORIES SEEDER ====================
  console.log('❓ Creating FAQ categories...');
  
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
      await prisma.fAQCategory.create({ data: categoryData });
      console.log(`✅ Created FAQ category: ${categoryData.name}`);
    }
  }

  console.log('🎉 Comprehensive seeder completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeder error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });