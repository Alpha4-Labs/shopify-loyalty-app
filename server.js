/**
 * Shopify Loyalty App Server
 * 
 * Fast loyalty integration with Shopify + Loyalteez
 * Production-ready webhook handler for automatic reward distribution
 */

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const LoyalteezClient = require('./loyalteez-client');
const WebhookHandler = require('./webhook-handler');
const { 
  verifyShopifyWebhook, 
  getWebhookTopic,
  getShopDomain,
  getApiVersion
} = require('./utils/shopify-verify');

// ==========================================
// CONFIGURATION
// ==========================================

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate required environment variables
const requiredEnvVars = ['SHOPIFY_WEBHOOK_SECRET'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0 && NODE_ENV === 'production') {
  console.error('❌ Missing required environment variables:', missingVars);
  process.exit(1);
}

// Initialize Loyalteez client
const loyalteez = new LoyalteezClient(
  process.env.LOYALTEEZ_BRAND_ID,
  process.env.LOYALTEEZ_API_URL || 'https://api.loyalteez.xyz'
);

// Initialize webhook handler
const webhookHandler = new WebhookHandler(loyalteez);

// ==========================================
// MIDDLEWARE
// ==========================================

// Store raw body for webhook verification
// CRITICAL: Must preserve raw body before JSON parsing
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ==========================================
// ROUTES
// ==========================================

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'shopify-loyalty-app',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    endpoints: {
      webhooks: '/webhooks/shopify',
      health: '/health',
      test: '/test/reward'
    }
  });
});

/**
 * Health check for monitoring
 */
app.get('/health', async (req, res) => {
  try {
    // Check Loyalteez API health
    let loyalteezHealth = null;
    try {
      loyalteezHealth = await loyalteez.checkHealth();
    } catch (error) {
      console.warn('⚠️  Loyalteez health check failed:', error.message);
    }
    
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      loyalteez: loyalteezHealth ? {
        status: loyalteezHealth.status,
        version: loyalteezHealth.version
      } : { status: 'unavailable' }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Main webhook endpoint
 * 
 * This is where Shopify sends all webhook notifications
 * 
 * @route POST /webhooks/shopify
 */
app.post('/webhooks/shopify', async (req, res) => {
  try {
    // ==========================================
    // STEP 1: VERIFY WEBHOOK AUTHENTICITY
    // ==========================================
    
    const isValid = verifyShopifyWebhook(
      req,
      process.env.SHOPIFY_WEBHOOK_SECRET
    );
    
    if (!isValid) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid webhook signature'
      });
    }
    
    // ==========================================
    // STEP 2: EXTRACT WEBHOOK DATA
    // ==========================================
    
    const topic = getWebhookTopic(req);
    const shop = getShopDomain(req);
    const apiVersion = getApiVersion(req);
    const data = req.body;
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📨 WEBHOOK RECEIVED`);
    console.log(`Topic: ${topic}`);
    console.log(`Shop: ${shop}`);
    console.log(`API Version: ${apiVersion || 'unknown'}`);
    console.log(`${'='.repeat(50)}\n`);
    
    // ==========================================
    // STEP 3: PROCESS WEBHOOK ASYNCHRONOUSLY
    // ==========================================
    
    // Respond to Shopify immediately (within 5 seconds required)
    res.status(200).json({ 
      received: true,
      topic,
      shop,
      timestamp: new Date().toISOString()
    });
    
    // Process webhook in background
    // This allows us to respond fast even if Loyalteez API is slow
    setImmediate(async () => {
      try {
        const result = await webhookHandler.handle(topic, data);
        console.log(`✅ Webhook processed successfully:`, {
          topic,
          success: result.success,
          skipped: result.skipped,
          reward: result.reward
        });
      } catch (error) {
        console.error(`❌ Error processing webhook:`, {
          topic,
          error: error.message,
          stack: error.stack
        });
        // TODO: Log to error tracking service (e.g., Sentry)
      }
    });
    
  } catch (error) {
    console.error('❌ Webhook endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * Test endpoint for manual testing
 * 
 * Usage: POST to /test/reward with { email, amount, eventType }
 * 
 * @route POST /test/reward
 */
app.post('/test/reward', async (req, res) => {
  if (NODE_ENV === 'production') {
    return res.status(403).json({ 
      error: 'Forbidden in production',
      message: 'Test endpoint disabled in production'
    });
  }
  
  try {
    const { email, amount, eventType = 'test_reward' } = req.body;
    
    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required'
      });
    }
    
    const result = await loyalteez.sendEvent(eventType, email, {
      test: true,
      amount: amount || 100,
      source: 'manual_test'
    });
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      response: error.response
    });
  }
});

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  
  res.status(error.status || 500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' 
      ? error.message 
      : 'Something went wrong',
    ...(NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log(`🚀 Shopify Loyalty App Server`);
  console.log('='.repeat(50));
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Port: ${PORT}`);
  console.log(`Webhooks: http://localhost:${PORT}/webhooks/shopify`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Test: http://localhost:${PORT}/test/reward`);
  console.log('='.repeat(50) + '\n');
  
  // Log configuration (without secrets)
  console.log('Configuration:');
  console.log(`  - Loyalteez API: ${loyalteez.apiUrl}`);
  console.log(`  - Brand ID: ${loyalteez.brandId.substring(0, 10)}...`);
  console.log(`  - Shopify Webhook Secret: ${process.env.SHOPIFY_WEBHOOK_SECRET ? 'SET' : 'NOT SET'}`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});

