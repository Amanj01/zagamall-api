const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test if we can connect to the database
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test if ContactInquiry table exists by trying to count records
    const count = await prisma.contactInquiry.count();
    console.log(`✅ ContactInquiry table exists with ${count} records`);
    
    // Test if we can create a test record
    const testInquiry = await prisma.contactInquiry.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
        status: 'pending'
      }
    });
    console.log('✅ Successfully created test inquiry:', testInquiry.id);
    
    // Clean up - delete the test record
    await prisma.contactInquiry.delete({
      where: { id: testInquiry.id }
    });
    console.log('✅ Successfully deleted test inquiry');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 