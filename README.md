# Shopify Loyalty App

> **Production-ready Shopify loyalty integration with Loyalteez**  
> Example implementation for integrating Shopify webhooks with Loyalteez rewards platform.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-green)](https://docs.loyalteez.app)

**What this does:** Automatically rewards your Shopify customers with LTZ tokens when they make purchases, sign up, or complete other actions. Fully integrated with Loyalteez blockchain-powered loyalty platform.

**Network**: This app defaults to **Loyalteez Mainnet** (`api.loyalteez.app`). To use Testnet, set `LOYALTEEZ_API_URL=https://api.loyalteez.xyz`.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Shopify store (any plan, including Partner development stores)
- A Loyalteez account ([partners.loyalteez.app](https://partners.loyalteez.app))

### Installation

```bash
# Clone the repository
git clone https://github.com/Alpha4-Labs/shopify-loyalty-app.git
cd shopify-loyalty-app

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Edit .env with your configuration
# See SETUP.md for detailed instructions
```

### Run Locally

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Your server will start on `http://localhost:3000`

---

## 📋 Features

✅ **Automatic Rewards** - Customers earn LTZ tokens on purchases, signups, and more  
✅ **Webhook Integration** - Secure, verified Shopify webhook handling  
✅ **Production Ready** - Error handling, logging, monitoring endpoints  
✅ **Multiple Deployment Options** - Railway, Cloudflare Workers, or any Node.js host  
✅ **Standard Events** - Uses standard automation events (`place_order`, `account_creation`)  
✅ **Comprehensive Documentation** - Step-by-step guides and examples  

---

## 🏗️ Architecture

```
Customer makes purchase
    ↓
Shopify detects event
    ↓
Shopify sends webhook to your app
    ↓
Your app verifies webhook signature
    ↓
Your app calls Loyalteez API (Mainnet)
    ↓
Customer receives LTZ tokens
    ↓
Balance updates automatically
```

**Key Components:**
- **Express Server** - Receives and processes Shopify webhooks
- **Webhook Handler** - Routes events and triggers rewards
- **Loyalteez Client** - Communicates with Loyalteez API
- **Shopify Verifier** - Validates webhook authenticity (HMAC-SHA256)

---

## 📚 Documentation

- **[SETUP.md](./docs/SETUP.md)** - Complete setup guide
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment instructions
- **[API.md](./docs/API.md)** - API reference
- **[TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

---

## 🔧 Configuration

### Environment Variables

```bash
# Shopify Configuration
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here
# Optional: Verify requests match this domain
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com

# Loyalteez Configuration
LOYALTEEZ_BRAND_ID=0xYourBrandWalletAddress
LOYALTEEZ_API_URL=https://api.loyalteez.app  # Default: Mainnet
# For testnet: use https://api.loyalteez.xyz

# Server Configuration
PORT=3000
NODE_ENV=production
```

See [.env.example](./.env.example) for all available options.

---

## 🚢 Deployment

### Option 1: Railway (Recommended for Beginners)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Set environment variables
railway variables set SHOPIFY_WEBHOOK_SECRET=your_secret
railway variables set LOYALTEEZ_BRAND_ID=your_brand_id

# Deploy
railway up

# Get your URL
railway domain
```

### Option 2: Cloudflare Workers (Edge Deployment)

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Set secrets
wrangler secret put SHOPIFY_WEBHOOK_SECRET

# Deploy
wrangler publish
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

---

## 🧪 Testing

### Test Webhook Endpoint

```bash
# Test the reward endpoint (development only)
curl -X POST http://localhost:3000/test/reward \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "amount": 100,
    "eventType": "test_reward"
  }'
```

### Test Health Check

```bash
curl http://localhost:3000/health
```

See [examples/](./examples/) for sample webhook payloads.

---

## 📖 Usage

### 1. Set Up Shopify Webhooks

In your Shopify admin:
1. Go to **Settings → Notifications**
2. Scroll to **Webhooks**
3. Click **Create webhook**
4. Configure:
   - **Event**: Order creation
   - **Format**: JSON
   - **URL**: `https://your-app-url.com/webhooks/shopify`
   - **API version**: 2024-10 (latest)

### 2. Configure Reward Rules

In your Loyalteez dashboard (Settings > Automation):
1. Enable **Automation**
2. Select **E-commerce** industry template
3. Configure rules for:
   - `Place Order` (triggered by `orders/create`)
   - `Create Account` (triggered by `customers/create`)
   - `Refer a Friend` (triggered by referral events)

### 3. Test with a Real Order

1. Place a test order in your Shopify store
2. Check your server logs for webhook processing
3. Verify rewards in Loyalteez dashboard

---

## 🎯 Supported Events

| Event | Trigger | Loyalteez Event Name |
|-------|---------|----------------------|
| `orders/create` | Customer places order | `place_order` |
| `customers/create` | New customer signup | `account_creation` |
| `orders/paid` | Payment confirmed | (Logged only) |
| `customers/update` | Profile updated | (Logged only) |

Customize rewards in your Loyalteez dashboard.

---

## 🔒 Security

- ✅ **HMAC Signature Verification** - All webhooks verified with Shopify's signature
- ✅ **Domain Verification** - Validates requests come from your specific shop
- ✅ **Environment Variables** - Secrets never committed to code
- ✅ **Error Handling** - Graceful failures, no sensitive data leaked

---

## 📝 Project Structure

```
shopify-loyalty-app/
├── server.js              # Express server and main entry point
├── webhook-handler.js     # Processes Shopify webhooks
├── loyalteez-client.js   # Loyalteez API client
├── worker.js              # Cloudflare Workers version
├── utils/
│   └── shopify-verify.js  # Webhook signature verification
├── examples/              # Example webhook payloads
├── docs/                  # Documentation
└── package.json           # Dependencies
```

---

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🆘 Support

- **Documentation**: [docs.loyalteez.app](https://docs.loyalteez.app)
- **Issues**: [GitHub Issues](https://github.com/Alpha4-Labs/shopify-loyalty-app/issues)
- **Email**: support@loyalteez.app
- **Discord**: [discord.gg/loyalteez](https://discord.gg/loyalteez)

---

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Integrated with [Loyalteez](https://loyalteez.app)
- Compatible with [Shopify](https://shopify.dev)

---

**Ready to launch your loyalty program?** [Get started →](./docs/SETUP.md)
