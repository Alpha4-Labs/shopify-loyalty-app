/**
 * Loyalteez API Client
 * 
 * Handles all communication with Loyalteez API.
 * Adapted to work with the actual API format (eventType, userEmail, brandId).
 * 
 * @see https://docs.loyalteez.app/api/rest-api
 */

const axios = require('axios');

class LoyalteezClient {
  /**
   * Create a new Loyalteez client
   * 
   * @param {string} brandId - Brand wallet address (optional for testnet)
   * @param {string} apiUrl - Loyalteez API base URL
   */
  constructor(brandId, apiUrl) {
    this.brandId = brandId || '0x0000000000000000000000000000000000000000'; // Placeholder for testnet
    this.apiUrl = apiUrl || 'https://api.loyalteez.xyz';
    this.endpoint = `${this.apiUrl}/loyalteez-api/manual-event`;
  }
  
  /**
   * Send a reward event to Loyalteez
   * 
   * @param {string} eventType - Event identifier (e.g., 'shopify_purchase')
   * @param {string} userEmail - Customer email address
   * @param {Object} metadata - Additional data about the event
   * @returns {Promise<Object>} - API response
   */
  async sendEvent(eventType, userEmail, metadata = {}) {
    try {
      // Format payload according to actual Loyalteez API format
      const payload = {
        brandId: this.brandId,
        eventType: eventType,
        userEmail: userEmail,
        domain: metadata.domain || 'shopify-store',
        sourceUrl: metadata.sourceUrl || metadata.order_url || null,
        metadata: {
          platform: 'shopify',
          timestamp: new Date().toISOString(),
          ...metadata
        }
      };
      
      // Remove null/undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === undefined) {
          delete payload[key];
        }
      });
      
      console.log(`📤 Sending event to Loyalteez:`, {
        eventType,
        userEmail,
        brandId: this.brandId,
        metadataKeys: Object.keys(metadata)
      });
      
      const response = await axios.post(this.endpoint, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log(`✅ Loyalteez response:`, {
        success: response.data.success,
        eventId: response.data.eventId,
        reward: response.data.reward
      });
      
      return response.data;
    } catch (error) {
      console.error(`❌ Loyalteez API error:`, {
        eventType,
        userEmail,
        error: error.message,
        status: error.response?.status,
        response: error.response?.data
      });
      
      // Re-throw with more context
      const enhancedError = new Error(
        `Loyalteez API error: ${error.message}`
      );
      enhancedError.status = error.response?.status;
      enhancedError.response = error.response?.data;
      throw enhancedError;
    }
  }
  
  /**
   * Reward a customer for a purchase
   * 
   * @param {string} email - Customer email
   * @param {number} orderTotal - Order total in dollars
   * @param {string|number} orderId - Shopify order ID
   * @param {string} orderUrl - Order URL (optional)
   * @returns {Promise<Object>} - Reward details
   */
  async rewardPurchase(email, orderTotal, orderId, orderUrl = null) {
    // Calculate LTZ: 10 LTZ per dollar spent (as per tutorial)
    const ltzAmount = Math.floor(orderTotal * 10);
    
    // Check for large order bonus
    const bonus = orderTotal >= 100 ? 1000 : 0;
    
    // Send base purchase reward
    await this.sendEvent('shopify_purchase', email, {
      order_id: orderId,
      order_total: orderTotal,
      order_url: orderUrl,
      ltz_earned: ltzAmount,
      currency: 'USD'
    });
    
    // Send bonus if applicable
    if (bonus > 0) {
      await this.sendEvent('shopify_large_order', email, {
        order_id: orderId,
        order_total: orderTotal,
        order_url: orderUrl,
        bonus_ltz: bonus,
        currency: 'USD'
      });
    }
    
    return {
      base_ltz: ltzAmount,
      bonus_ltz: bonus,
      total_ltz: ltzAmount + bonus
    };
  }
  
  /**
   * Reward a new customer signup
   * 
   * @param {string} email - Customer email
   * @param {string|number} customerId - Shopify customer ID
   * @returns {Promise<Object>} - API response
   */
  async rewardSignup(email, customerId) {
    return await this.sendEvent('shopify_signup', email, {
      customer_id: customerId,
      ltz_earned: 500
    });
  }
  
  /**
   * Reward a customer referral
   * 
   * @param {string} email - Referrer email
   * @param {string} referredEmail - Referred customer email
   * @returns {Promise<Object>} - API response
   */
  async rewardReferral(email, referredEmail) {
    return await this.sendEvent('shopify_referral', email, {
      referred_email: referredEmail,
      ltz_earned: 2000
    });
  }
  
  /**
   * Check API health
   * 
   * @returns {Promise<Object>} - Health check response
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.apiUrl}/loyalteez-api/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      throw error;
    }
  }
}

module.exports = LoyalteezClient;

