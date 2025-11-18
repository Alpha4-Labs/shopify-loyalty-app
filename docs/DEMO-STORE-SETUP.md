# Demo Shopify Store Setup

Guide for setting up a demo Shopify store for testing the loyalty app.

---

## Option 1: Shopify Partner Development Store (Recommended)

### Step 1: Create Partner Account

1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Sign up for a free Partner account
3. Complete onboarding

### Step 2: Create Development Store

1. In Partner dashboard, click **Stores → Add store**
2. Select **Development store**
3. Choose **Development store** type
4. Fill in:
   - Store name: `loyalty-demo-store` (or your choice)
   - Store purpose: Testing
   - Password: Set a password for store access
5. Click **Create store**

### Step 3: Access Your Store

1. You'll be redirected to your store admin
2. URL format: `https://your-store-name.myshopify.com/admin`
3. Login with your Partner account

### Step 4: Add Test Products

1. Go to **Products → Add product**
2. Add a few test products:
   - Product 1: "Test T-Shirt" - $25.00
   - Product 2: "Test Mug" - $15.00
   - Product 3: "Test Hat" - $30.00

### Step 5: Configure Test Payment

1. Go to **Settings → Payments**
2. Enable **Bogus Gateway** (for testing)
3. Test cards:
   - Success: `1`
   - Decline: `2`
   - Insufficient funds: `3`

### Step 6: Set Up Webhooks

Follow the webhook setup in [SETUP.md](./SETUP.md#step-4-set-up-shopify-webhooks).

---

## Option 2: Existing Shopify Store

If you already have a Shopify store:

### Step 1: Create Test Environment

1. Use a separate webhook URL for testing
2. Or use a staging/test environment
3. Consider using test orders only

### Step 2: Test Safely

1. Use test payment methods
2. Create test customer accounts
3. Monitor webhook processing carefully

---

## Demo Store Configuration

### Recommended Settings

**Store Details:**
- Store name: `Loyalty Demo Store`
- Store email: Your email
- Store address: Test address

**Payment:**
- Bogus Gateway enabled (for testing)
- Or use Shopify's test mode

**Shipping:**
- Free shipping (for simplicity)
- Or flat rate shipping

**Checkout:**
- Customer accounts optional (for testing)
- Email collection enabled

---

## Testing Workflow

### 1. Place Test Order

1. Go to your storefront
2. Add product to cart
3. Go to checkout
4. Use test email: `test@example.com`
5. Use Bogus Gateway card: `1`
6. Complete checkout

### 2. Verify Webhook

1. Check server logs for webhook receipt
2. Verify webhook processing
3. Check Loyalteez dashboard for event

### 3. Test Customer Signup

1. Create account on storefront
2. Verify welcome bonus webhook
3. Check Loyalteez dashboard

---

## Placeholder Configuration

For demo/testing without a real store:

### .env Configuration

```bash
# Demo/Test Configuration
SHOPIFY_WEBHOOK_SECRET=placeholder_secret_for_testing
SHOPIFY_SHOP_DOMAIN=demo-store.myshopify.com

# Testnet Configuration
LOYALTEEZ_BRAND_ID=0x0000000000000000000000000000000000000000
LOYALTEEZ_API_URL=https://api.loyalteez.xyz
```

### Testing Without Shopify

You can test the webhook handler using sample payloads:

```bash
# Use sample webhook payload
curl -X POST http://localhost:3000/webhooks/shopify \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: orders/create" \
  -H "X-Shopify-Shop-Domain: demo-store.myshopify.com" \
  -H "X-Shopify-Hmac-Sha256: test_signature" \
  -d @examples/sample-order-webhook.json
```

**Note:** Signature verification will fail without real secret, but you can test the handler logic.

---

## Storefront Customization (Optional)

### Add Loyalty Balance Display

Add to your theme's `cart.liquid` or `checkout.liquid`:

```liquid
<div class="loyalty-rewards">
  <h3>Your Rewards Balance</h3>
  <div id="loyalty-balance">Loading...</div>
  
  <script>
    const customerEmail = {{ customer.email | json }};
    
    if (customerEmail) {
      fetch('https://api.loyalteez.xyz/loyalteez-api/balance?email=' + customerEmail)
        .then(res => res.json())
        .then(data => {
          const balance = data.balance || 0;
          const dollars = (balance / 1000).toFixed(2);
          
          document.getElementById('loyalty-balance').innerHTML = `
            <p><strong>${balance} LTZ</strong> = $${dollars} in rewards</p>
            <p>You can use this on your next purchase!</p>
          `;
        })
        .catch(err => {
          document.getElementById('loyalty-balance').innerHTML = 
            '<p>Unable to load balance</p>';
        });
    }
  </script>
</div>
```

---

## Best Practices

### For Development

- ✅ Use Partner development stores (free)
- ✅ Use Bogus Gateway for payments
- ✅ Create test customer accounts
- ✅ Monitor webhook logs carefully

### For Production

- ⚠️ Use real payment gateways
- ⚠️ Test with small orders first
- ⚠️ Monitor reward distribution
- ⚠️ Set up error alerts

---

## Resources

- **Shopify Partner Program**: [partners.shopify.com](https://partners.shopify.com)
- **Development Stores**: [help.shopify.com/en/partners/dashboard/development-stores](https://help.shopify.com/en/partners/dashboard/development-stores)
- **Bogus Gateway**: [help.shopify.com/en/manual/payments/testing-your-checkout](https://help.shopify.com/en/manual/payments/testing-your-checkout)

---

## Need Help?

- **Shopify Support**: [help.shopify.com](https://help.shopify.com)
- **Partner Support**: [partners.shopify.com/support](https://partners.shopify.com/support)
- **Loyalteez Support**: support@loyalteez.app

