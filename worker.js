/**
 * Cloudflare Worker for Shopify Webhooks
 * 
 * Ultra-fast, edge-deployed webhook handler
 * Deploy with: wrangler publish
 * 
 * @see https://developers.cloudflare.com/workers/
 */

// Environment variables (set via Cloudflare dashboard or wrangler secret)
// - SHOPIFY_WEBHOOK_SECRET
// - LOYALTEEZ_BRAND_ID (optional for testnet)
// - LOYALTEEZ_API_URL (defaults to testnet)

const LOYALTEEZ_API_BASE = 'https://api.loyalteez.app'; // Default to Mainnet
const LOYALTEEZ_ENDPOINT = `${LOYALTEEZ_API_BASE}/loyalteez-api/manual-event`;

import { landingPage } from './landing-page-esm.js';

/**
 * Main worker handler
 */
export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-*',
    };
    
    // Handle OPTIONS request (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    const url = new URL(request.url);
    
    // Health check
    if (url.pathname === '/health' && request.method === 'GET') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'shopify-loyalty-app-worker',
        timestamp: new Date().toISOString(),
        environment: 'cloudflare-workers'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Root endpoint - Serve Landing Page
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(landingPage, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    // Simulation Endpoint
    if (url.pathname === '/simulate' && request.method === 'POST') {
      try {
        const { email, amount, domain } = await request.json();
        
        if (!email || !amount) {
          return new Response(JSON.stringify({ error: 'Missing email or amount' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const orderId = Math.floor(Math.random() * 1000000000);
        
        // Simulate Shopify Payload
        const mockOrder = {
          id: orderId,
          email: email,
          total_price: String(amount),
          currency: 'USD',
          test: true, // Mark as test so we can log it
          customer: {
            id: Math.floor(Math.random() * 1000000000),
            email: email,
            first_name: 'Test',
            last_name: 'User'
          }
        };

        const brandId = env.LOYALTEEZ_BRAND_ID || '0x0000000000000000000000000000000000000000';
        const apiUrl = env.LOYALTEEZ_API_URL || LOYALTEEZ_API_BASE;
        
        // Call the internal handler directly
        await handleOrderCreated(mockOrder, brandId, apiUrl, domain || 'shopify-simulation');

        return new Response(JSON.stringify({
          success: true,
          message: 'Simulation processed successfully',
          reward: {
            email,
            amount,
            ltz_estimated: Math.floor(amount * 10)
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Webhook endpoint
    if (url.pathname === '/webhooks/shopify' && request.method === 'POST') {
      return handleWebhook(request, env, corsHeaders);
    }
    
    // 404
    return new Response('Not found', { 
      status: 404,
      headers: corsHeaders 
    });
  }
};

/**
 * Handle Shopify webhook
 */
async function handleWebhook(request, env, corsHeaders) {
  try {
    // Get webhook data
    const body = await request.text();
    const data = JSON.parse(body);
    const topic = request.headers.get('X-Shopify-Topic');
    const shop = request.headers.get('X-Shopify-Shop-Domain');
    
    // Verify webhook signature
    const hmac = request.headers.get('X-Shopify-Hmac-Sha256');
    const isValid = await verifyWebhook(body, hmac, env.SHOPIFY_WEBHOOK_SECRET);
    
    if (!isValid) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Invalid webhook signature'
      }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`📨 Webhook received: ${topic} from ${shop}`);
    
    // Respond immediately (Shopify requires < 5 seconds)
    const responsePromise = Promise.resolve(new Response(JSON.stringify({
      received: true,
      topic,
      shop,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }));
    
    // Process webhook asynchronously
    processWebhook(topic, data, env, shop).catch(error => {
      console.error('❌ Error processing webhook:', error);
    });
    
    return responsePromise;
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Process webhook asynchronously
 */
async function processWebhook(topic, data, env, shopDomain) {
  const brandId = env.LOYALTEEZ_BRAND_ID || '0x0000000000000000000000000000000000000000';
  const apiUrl = env.LOYALTEEZ_API_URL || LOYALTEEZ_API_BASE;
  
  try {
    if (topic === 'orders/create') {
      await handleOrderCreated(data, brandId, apiUrl, shopDomain);
    } else if (topic === 'customers/create') {
      await handleCustomerCreated(data, brandId, apiUrl, shopDomain);
    } else {
      console.log(`ℹ️  Unhandled topic: ${topic}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${topic}:`, error);
    throw error;
  }
}

/**
 * Handle order creation
 */
async function handleOrderCreated(order, brandId, apiUrl, shopDomain) {
  const email = order.customer?.email;
  const orderTotal = parseFloat(order.total_price || 0);
  
  if (!email || order.test || orderTotal < 0.01) {
    console.log('⚠️  Skipping order:', { email, test: order.test, total: orderTotal });
    return;
  }
  
  const ltzAmount = Math.floor(orderTotal * 10);
  const bonus = orderTotal >= 100 ? 1000 : 0;
  
  // Send base purchase reward
  // Using standard event 'place_order'
  await sendLoyalteezEvent('place_order', email, brandId, apiUrl, {
    order_id: order.id,
    order_total: orderTotal,
    ltz_earned: ltzAmount,
    domain: shopDomain
  });
  
  // Send bonus if applicable
  if (bonus > 0) {
    await sendLoyalteezEvent('shopify_large_order', email, brandId, apiUrl, {
      order_id: order.id,
      order_total: orderTotal,
      bonus_ltz: bonus,
      domain: shopDomain
    });
  }
  
  console.log(`✅ Rewarded ${email}: ${ltzAmount + bonus} LTZ`);
}

/**
 * Handle customer creation
 */
async function handleCustomerCreated(customer, brandId, apiUrl, shopDomain) {
  const email = customer.email;
  
  if (!email) {
    console.log('⚠️  No email, skipping welcome bonus');
    return;
  }
  
  // Using standard event 'account_creation'
  await sendLoyalteezEvent('account_creation', email, brandId, apiUrl, {
    customer_id: customer.id,
    ltz_earned: 500,
    domain: shopDomain
  });
  
  console.log(`✅ Welcome bonus sent to ${email}`);
}

/**
 * Send event to Loyalteez API
 */
async function sendLoyalteezEvent(eventType, userEmail, brandId, apiUrl, metadata = {}) {
  // Use passed domain if available, otherwise default
  const domain = metadata.domain || 'shopify-store';
  
  const payload = {
    brandId,
    eventType,
    userEmail,
    domain: domain,
    metadata: {
      platform: 'shopify',
      timestamp: new Date().toISOString(),
      ...metadata
    }
  };
  
  const response = await fetch(`${apiUrl}/loyalteez-api/manual-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error(`Loyalteez API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Verify Shopify webhook signature
 */
async function verifyWebhook(body, hmac, secret) {
  if (!hmac || !secret) {
    return false;
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(body);
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  // Timing-safe comparison
  if (hmac.length !== base64.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < hmac.length; i++) {
    result |= hmac.charCodeAt(i) ^ base64.charCodeAt(i);
  }
  
  return result === 0;
}
