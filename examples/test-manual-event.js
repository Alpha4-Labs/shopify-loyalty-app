/**
 * Test Manual Event Script
 * 
 * Test the Loyalteez API integration without Shopify webhooks
 * 
 * Usage: node examples/test-manual-event.js
 */

require('dotenv').config();
const LoyalteezClient = require('../loyalteez-client');

async function testManualEvent() {
  console.log('🧪 Testing Loyalteez API Integration\n');
  
  // Initialize client
  const client = new LoyalteezClient(
    process.env.LOYALTEEZ_BRAND_ID,
    process.env.LOYALTEEZ_API_URL || 'https://api.loyalteez.xyz'
  );
  
  // Test health check
  console.log('1. Testing health check...');
  try {
    const health = await client.checkHealth();
    console.log('✅ Health check passed:', health.status);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return;
  }
  
  console.log('\n2. Testing manual event...');
  
  // Test event
  const testEmail = 'test@example.com';
  const testEventType = 'test_reward';
  
  try {
    const result = await client.sendEvent(testEventType, testEmail, {
      test: true,
      amount: 100,
      source: 'manual_test_script'
    });
    
    console.log('✅ Event sent successfully:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Event failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
  
  console.log('\n✅ Test complete!');
}

// Run test
testManualEvent().catch(console.error);

