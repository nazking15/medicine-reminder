const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { generatePositiveMessage } = require('./deepseekService');

async function testDeepseek() {
  try {
    console.log('Testing Deepseek API integration...\n');
    
    // Test case 1: Basic message
    console.log('Test 1: Basic message without context');
    const message1 = await generatePositiveMessage();
    console.log('Response:', message1);

    // Test case 2: Personalized message
    console.log('\nTest 2: Personalized message with context');
    const message2 = await generatePositiveMessage({
      name: 'Nawaz',
      medicineName: 'Vitamin D'
    });
    console.log('Response:', message2);

    console.log('\n✅ Deepseek API test completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Run the test
testDeepseek(); 