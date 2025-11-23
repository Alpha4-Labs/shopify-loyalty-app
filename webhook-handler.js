/**
 * Shopify Webhook Handler
 * 
 * Processes webhooks from Shopify and triggers rewards via Loyalteez API.
 * Handles orders, customers, and other Shopify events.
 */

const LoyalteezClient = require('./loyalteez-client');

class WebhookHandler {
  /**
   * Create a new webhook handler
   * 
   * @param {LoyalteezClient} loyalteezClient - Loyalteez API client instance
   */
  constructor(loyalteezClient) {
    this.loyalteez = loyalteezClient;
  }
  
  /**
   * Main webhook routing function
   * 
   * @param {string} topic - Webhook topic (e.g., 'orders/create')
   * @param {Object} data - Webhook payload data
   * @param {string} shopDomain - Shopify store domain
   * @returns {Promise<Object>} - Processing result
   */
  async handle(topic, data, shopDomain = null) {
    console.log(`📨 Processing webhook: ${topic} from ${shopDomain || 'unknown'}`);
    this.shopDomain = shopDomain;
    
    try {
      switch (topic) {
        case 'orders/create':
          return await this.handleOrderCreated(data);
        
        case 'orders/paid':
          return await this.handleOrderPaid(data);
        
        case 'customers/create':
          return await this.handleCustomerCreated(data);
        
        case 'customers/update':
          return await this.handleCustomerUpdated(data);
        
        default:
          console.log(`ℹ️  Unhandled webhook topic: ${topic}`);
          return { 
            success: true, 
            handled: false,
            topic 
          };
      }
    } catch (error) {
      console.error(`❌ Error handling webhook:`, {
        topic,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
  
  /**
   * Handle new order creation
   * 
   * Triggered when: Customer places an order
   * Reward: Base LTZ based on order total + bonuses
   * 
   * @param {Object} order - Shopify order object
   * @returns {Promise<Object>} - Processing result
   */
  async handleOrderCreated(order) {
    // Extract customer info
    const email = order.customer?.email;
    const customerId = order.customer?.id;
    
    if (!email) {
      console.log('⚠️  No customer email, skipping reward');
      return { 
        success: true, 
        skipped: true, 
        reason: 'no_email' 
      };
    }
    
    // Get order details
    const orderId = order.id;
    const orderNumber = order.order_number;
    const orderTotal = parseFloat(order.total_price || 0);
    const currency = order.currency || 'USD';
    const orderUrl = order.order_status_url;
    
    console.log(`💰 Order #${orderNumber}: $${orderTotal} ${currency} by ${email}`);
    
    // Check if order is test
    if (order.test) {
      console.log('🧪 Test order, skipping reward');
      return { 
        success: true, 
        skipped: true, 
        reason: 'test_order' 
      };
    }
    
    // Check minimum order value
    if (orderTotal < 0.01) {
      console.log('⚠️  Order too small, skipping reward');
      return { 
        success: true, 
        skipped: true, 
        reason: 'below_minimum' 
      };
    }
    
    // Reward the purchase
    const reward = await this.loyalteez.rewardPurchase(
      email,
      orderTotal,
      orderId,
      orderUrl,
      this.shopDomain
    );
    
    console.log(`✅ Rewarded ${email}: ${reward.total_ltz} LTZ`);
    
    return {
      success: true,
      email,
      order_id: orderId,
      order_number: orderNumber,
      order_total: orderTotal,
      reward
    };
  }
  
  /**
   * Handle order payment confirmation
   * 
   * Triggered when: Payment is confirmed (useful for pending payments)
   * Action: Additional verification or delayed rewards
   * 
   * @param {Object} order - Shopify order object
   * @returns {Promise<Object>} - Processing result
   */
  async handleOrderPaid(order) {
    console.log(`✓ Order #${order.order_number} paid`);
    
    // You can add additional reward logic here
    // For example, bonus for using specific payment methods
    
    return { 
      success: true, 
      action: 'payment_confirmed',
      order_id: order.id,
      order_number: order.order_number
    };
  }
  
  /**
   * Handle new customer signup
   * 
   * Triggered when: New customer account is created
   * Reward: Welcome bonus
   * 
   * @param {Object} customer - Shopify customer object
   * @returns {Promise<Object>} - Processing result
   */
  async handleCustomerCreated(customer) {
    const email = customer.email;
    const customerId = customer.id;
    
    if (!email) {
      console.log('⚠️  No customer email, skipping welcome bonus');
      return { 
        success: true, 
        skipped: true, 
        reason: 'no_email' 
      };
    }
    
    console.log(`👤 New customer: ${email}`);
    
    // Send welcome bonus
    await this.loyalteez.rewardSignup(email, customerId, this.shopDomain);
    
    console.log(`✅ Welcome bonus sent to ${email}`);
    
    return {
      success: true,
      email,
      customer_id: customerId,
      reward: 'welcome_bonus'
    };
  }
  
  /**
   * Handle customer profile updates
   * 
   * Triggered when: Customer updates their profile
   * Action: Sync any changes, detect referrals
   * 
   * @param {Object} customer - Shopify customer object
   * @returns {Promise<Object>} - Processing result
   */
  async handleCustomerUpdated(customer) {
    // You can track profile completions, referral codes, etc.
    console.log(`👤 Customer updated: ${customer.email}`);
    
    return { 
      success: true, 
      action: 'profile_synced',
      email: customer.email,
      customer_id: customer.id
    };
  }
  
  /**
   * Get order statistics for debugging
   * 
   * @param {Object} order - Shopify order object
   * @returns {Object} - Order statistics
   */
  getOrderStats(order) {
    return {
      id: order.id,
      number: order.order_number,
      total: order.total_price,
      currency: order.currency,
      items: order.line_items?.length || 0,
      customer: order.customer?.email || 'guest',
      created: order.created_at,
      test: order.test || false
    };
  }
}

module.exports = WebhookHandler;

