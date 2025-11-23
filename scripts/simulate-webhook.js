/**
 * Simulate Shopify Webhook
 * 
 * Generates a valid HMAC signature and sends a webhook to your local server.
 * Perfect for testing the full flow without a real Shopify store.
 * 
 * Usage: 
 *   node scripts/simulate-webhook.js [order|customer]
 */

require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');

const PORT = process.env.PORT || 3000;
const SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;
const SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN || 'test-store.myshopify.com';

if (!SECRET) {
  console.error('❌ Error: SHOPIFY_WEBHOOK_SECRET not found in .env');
  process.exit(1);
}

// Sample Payloads
const PAYLOADS = {
  order: {
    id: 123456789,
    email: "customer@example.com",
    total_price: "45.00",
    currency: "USD",
    created_at: new Date().toISOString(),
    order_number: 1001,
    customer: {
      id: 987654321,
      email: "customer@example.com",
      first_name: "John",
      last_name: "Doe"
    }
  },
  customer: {
    id: 987654321,
    email: "new-user@example.com",
    first_name: "Alice",
    last_name: "Smith",
    created_at: new Date().toISOString(),
    state: "enabled"
  }
};

async function simulateWebhook() {
  const type = process.argv[2] || 'order';
  const topic = type === 'customer' ? 'customers/create' : 'orders/create';
  const payload = PAYLOADS[type] || PAYLOADS.order;
  
  console.log(`🧪 Simulating ${topic} webhook...`);
  console.log(`📦 Payload:`, JSON.stringify(payload, null, 2));
  
  // 1. Stringify payload
  const body = JSON.stringify(payload);
  
  // 2. Calculate HMAC
  const hmac = crypto
    .createHmac('sha256', SECRET)
    .update(body, 'utf8')
    .digest('base64');
    
  console.log(`🔐 Generated HMAC: ${hmac}`);
  
  // 3. Send Request
  try {
    console.log(`🚀 Sending to http://localhost:${PORT}/webhooks/shopify...`);
    
    const response = await axios.post(`http://localhost:${PORT}/webhooks/shopify`, payload, {
      headers: {
        'X-Shopify-Topic': topic,
        'X-Shopify-Shop-Domain': SHOP_DOMAIN,
        'X-Shopify-Hmac-Sha256': hmac,
        'X-Shopify-Api-Version': '2025-10',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Server Response: ${response.status} ${response.statusText}`);
    console.log(response.data);
    
  } catch (error) {
    console.error(`❌ Request Failed:`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

simulateWebhook();

