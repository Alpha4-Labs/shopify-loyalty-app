/**
 * Shopify Webhook Verification
 * 
 * Shopify signs all webhooks with HMAC-SHA256.
 * We need to verify this signature to ensure authenticity.
 * 
 * @see https://shopify.dev/docs/api/admin-rest/webhooks/verification
 */

const crypto = require('crypto');

/**
 * Verify that a webhook request came from Shopify
 * 
 * @param {Object} req - Express request object
 * @param {string} secret - Shopify webhook secret
 * @returns {boolean} - True if verified, false otherwise
 */
function verifyShopifyWebhook(req, secret) {
  // Get the HMAC signature from headers
  const hmacHeader = req.headers['x-shopify-hmac-sha256'];
  
  if (!hmacHeader) {
    console.error('❌ Missing HMAC header');
    return false;
  }
  
  // Get the raw body (must be unchanged)
  const body = req.rawBody;
  
  if (!body) {
    console.error('❌ Missing raw body');
    return false;
  }
  
  // Generate our own HMAC signature
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');
  
  // Compare signatures (timing-safe comparison)
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmacHeader),
      Buffer.from(hash)
    );
  } catch (error) {
    console.error('❌ Error comparing signatures:', error.message);
    return false;
  }
}

/**
 * Get webhook topic from headers
 * 
 * @param {Object} req - Express request object
 * @returns {string|null} - Webhook topic (e.g., 'orders/create')
 */
function getWebhookTopic(req) {
  return req.headers['x-shopify-topic'] || null;
}

/**
 * Get shop domain from headers
 * 
 * @param {Object} req - Express request object
 * @returns {string|null} - Shop domain (e.g., 'your-store.myshopify.com')
 */
function getShopDomain(req) {
  return req.headers['x-shopify-shop-domain'] || null;
}

/**
 * Get webhook API version from headers
 * 
 * @param {Object} req - Express request object
 * @returns {string|null} - API version (e.g., '2024-10')
 */
function getApiVersion(req) {
  return req.headers['x-shopify-api-version'] || null;
}

module.exports = {
  verifyShopifyWebhook,
  getWebhookTopic,
  getShopDomain,
  getApiVersion
};

