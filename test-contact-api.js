const fetch = require('node-fetch');

async function testContactAPI() {
  try {
    console.log('🔍 Testing contact API...');
    
    // Test contact form submission
    const testData = {
      name: 'Test User API',
      email: 'testapi@example.com',
      phone: '+964750123456',
      subject: 'feedback',
      message: 'This is a test feedback message from API'
    };
    
    console.log('📤 Sending test data:', testData);
    
    const response = await fetch('http://localhost:5000/api/contact/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Contact API test successful:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Contact API test failed:', response.status, response.statusText);
      console.log('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Contact API test error:', error.message);
  }
}

testContactAPI(); 