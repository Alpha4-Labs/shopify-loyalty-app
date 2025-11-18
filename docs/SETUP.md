# Setup Guide

Complete step-by-step guide to set up your Shopify loyalty app.

---

## Prerequisites

Before starting, make sure you have:

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] A Shopify store (any plan, including Partner development stores)
- [ ] A Loyalteez account ([Sign up](https://partners.loyalteez.xyz)) - Free to start
- [ ] Basic command line knowledge
- [ ] A code editor (VS Code recommended)

---

## Step 1: Install the Project

```bash
# Clone the repository
git clone https://github.com/loyalteez/shopify-loyalty-app.git
cd shopify-loyalty-app

# Install dependencies
npm install
```

---

## Step 2: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your favorite editor
# Windows: notepad .env
# Mac/Linux: nano .env
```

### Required Variables

```bash
# Shopify Webhook Secret (we'll get this in Step 4)
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here

# Your Shopify store domain
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
```

### Optional Variables (for testnet/demo)

```bash
# Brand ID (optional for testnet - uses placeholder if not set)
LOYALTEEZ_BRAND_ID=0x0000000000000000000000000000000000000000

# Loyalteez API URL (defaults to testnet)
LOYALTEEZ_API_URL=https://api.loyalteez.xyz

# Server port (defaults to 3000)
PORT=3000

# Environment (development/production)
NODE_ENV=development
```

---

## Step 3: Set Up Loyalteez Account

### 3.1 Create Account

1. Go to [partners.loyalteez.xyz](https://partners.loyalteez.xyz)
2. Sign up with your email
3. Complete onboarding

### 3.2 Configure Reward Rules

In your Loyalteez dashboard, create reward rules:

**Rule 1: Purchase Rewards**
- Event Name: `shopify_purchase`
- LTZ Amount: 10 per $1 spent (or customize)
- Auto-approve: Yes

**Rule 2: Welcome Bonus**
- Event Name: `shopify_signup`
- LTZ Amount: 500
- Auto-approve: Yes

**Rule 3: Large Order Bonus**
- Event Name: `shopify_large_order`
- LTZ Amount: 1000
- Auto-approve: Yes
- Conditions: `order_total >= 100`

---

## Step 4: Set Up Shopify Webhooks

### 4.1 Access Webhook Settings

1. Log into your Shopify admin
2. Go to **Settings → Notifications**
3. Scroll down to **Webhooks** section
4. Click **Create webhook**

### 4.2 Create Order Creation Webhook

**Webhook 1: Order Creation**

- **Event**: Order creation
- **Format**: JSON
- **URL**: `https://your-app-url.com/webhooks/shopify`
  - For local testing: Use [ngrok](https://ngrok.com/) or similar
  - For production: Your deployed URL
- **Webhook API version**: 2024-10 (latest)

Click **Save webhook**

### 4.3 Create Customer Creation Webhook

**Webhook 2: Customer Creation**

- **Event**: Customer creation
- **Format**: JSON
- **URL**: Same as above
- **Webhook API version**: 2024-10

Click **Save webhook**

### 4.4 Get Webhook Secret

After creating your first webhook:

1. Click on the webhook you just created
2. Look for **"Webhook signature"** or **"Secret"**
3. Copy the secret key
4. Update your `.env` file:

```bash
SHOPIFY_WEBHOOK_SECRET=your_actual_secret_here
```

---

## Step 5: Test Locally

### 5.1 Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

You should see:

```
==================================================
🚀 Shopify Loyalty App Server
==================================================
Environment: development
Port: 3000
Webhooks: http://localhost:3000/webhooks/shopify
Health: http://localhost:3000/health
==================================================
```

### 5.2 Test Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "healthy",
  "uptime": 5.234,
  "memory": { ... },
  "timestamp": "2025-11-17T10:00:00.000Z"
}
```

### 5.3 Test with ngrok (Local Development)

For local testing, expose your server to the internet:

```bash
# Install ngrok (if not installed)
# https://ngrok.com/download

# Expose local server
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and use it in Shopify webhook settings.

---

## Step 6: Test with Real Order

### 6.1 Place Test Order

1. Go to your Shopify store
2. Add a product to cart
3. Use Shopify's **Bogus Gateway** for testing:
   - Go to: **Settings → Payments**
   - Enable **"Bogus Gateway"**
   - Use test card: `1` (for success)
4. Complete checkout

### 6.2 Check Logs

Watch your server logs for webhook processing:

```
==================================================
📨 WEBHOOK RECEIVED
Topic: orders/create
Shop: your-store.myshopify.com
==================================================

💰 Order #1001: $45.00 USD by customer@email.com
📤 Sending event to Loyalteez: shopify_purchase
✅ Loyalteez response: { success: true, ltz_credited: 450 }
✅ Rewarded customer@email.com: 450 LTZ
```

### 6.3 Verify in Loyalteez Dashboard

1. Go to [partners.loyalteez.xyz/analytics](https://partners.loyalteez.xyz/analytics)
2. You should see the `shopify_purchase` event
3. Click on the event to see details

---

## Step 7: Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick options:**

- **Railway**: `railway up`
- **Cloudflare Workers**: `wrangler publish`
- **Heroku**: `git push heroku main`

---

## Troubleshooting

### Webhooks Not Received

**Check:**
- [ ] Is your server running?
- [ ] Is the webhook URL correct in Shopify settings?
- [ ] Is your server publicly accessible? (not `localhost`)
- [ ] Are you behind a firewall?

**Solution:**
```bash
# Test webhook endpoint manually
curl -X POST https://your-app-url.com/health

# Should return 200 OK
```

### "Invalid webhook signature" Error

**Check:**
- [ ] Did you copy the webhook secret correctly?
- [ ] Is the secret set in environment variables?
- [ ] Are you modifying the request body before verification?

**Solution:**
Make sure you're using the raw body for verification (already handled in `server.js`).

### Loyalteez API Errors

**Check:**
- [ ] Is your API URL correct? (testnet: `https://api.loyalteez.xyz`)
- [ ] Did you create reward rules in the dashboard?
- [ ] Is the API endpoint accessible?

**Solution:**
```bash
# Test Loyalteez API directly
curl -X POST https://api.loyalteez.xyz/loyalteez-api/health

# Should return healthy status
```

---

## Next Steps

- ✅ Your app is now running!
- 📖 Read [API.md](./API.md) for API reference
- 🚀 Deploy to production (see [DEPLOYMENT.md](./DEPLOYMENT.md))
- 🧪 Test with more events (see [examples/](../examples/))

---

## Need Help?

- **Documentation**: [docs.loyalteez.app](https://docs.loyalteez.app)
- **Issues**: [GitHub Issues](https://github.com/loyalteez/shopify-loyalty-app/issues)
- **Email**: support@loyalteez.app
- **Discord**: [discord.gg/loyalteez](https://discord.gg/loyalteez)

