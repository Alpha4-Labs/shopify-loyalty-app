# Shopify Loyalty App

> **Demo repository: Shopify loyalty integration with Loyalteez**  
> Example implementation for integrating Shopify webhooks with Loyalteez rewards platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

> **⚠️ Demo Repository**  
> This is a **demo/example repository** for educational purposes. It demonstrates how to integrate Shopify webhooks with the Loyalteez API. While the code is functional and tested, it's intended as a reference implementation rather than a production-ready solution.
> 
> **For production use**, please:
> - Review and adapt the code to your specific needs
> - Add proper error handling and monitoring
> - Implement rate limiting and security best practices
> - Add comprehensive testing
> - Follow your organization's deployment standards

**What this does:** Automatically rewards your Shopify customers with LTZ tokens when they make purchases, sign up, or complete other actions. Fully integrated with Loyalteez blockchain-powered loyalty platform.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Shopify store (any plan, including Partner development stores)
- A Loyalteez account ([partners.loyalteez.xyz](https://partners.loyalteez.xyz)) - Free to start

### Installation

```bash
# Clone the repository
git clone https://github.com/loyalteez/shopify-loyalty-app.git
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
✅ **Testnet Compatible** - Works with Loyalteez testnet (no brand ID required)  
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
Your app calls Loyalteez API
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
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com

# Loyalteez Configuration
LOYALTEEZ_BRAND_ID=0x0000000000000000000000000000000000000000  # Optional for testnet
LOYALTEEZ_API_URL=https://api.loyalteez.xyz  # Testnet URL

# Server Configuration
PORT=3000
NODE_ENV=development
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
railway variables set LOYALTEEZ_API_URL=https://api.loyalteez.xyz

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

In your Loyalteez dashboard:
1. Go to **Rules**
2. Create rules for:
   - `shopify_purchase` - Base purchase rewards
   - `shopify_signup` - Welcome bonus
   - `shopify_large_order` - Large order bonuses

### 3. Test with a Real Order

1. Place a test order in your Shopify store
2. Check your server logs for webhook processing
3. Verify rewards in Loyalteez dashboard

---

## 🎯 Supported Events

| Event | Trigger | Default Reward |
|-------|---------|----------------|
| `orders/create` | Customer places order | 10 LTZ per $1 spent |
| `orders/paid` | Payment confirmed | Logged (no reward) |
| `customers/create` | New customer signup | 500 LTZ welcome bonus |
| `customers/update` | Profile updated | Logged (no reward) |

Customize rewards in your Loyalteez dashboard.

---

## 🔒 Security

- ✅ **HMAC Signature Verification** - All webhooks verified with Shopify's signature
- ✅ **Environment Variables** - Secrets never committed to code
- ✅ **Error Handling** - Graceful failures, no sensitive data leaked
- ✅ **Rate Limiting** - Can be added via middleware

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
- **Issues**: [GitHub Issues](https://github.com/loyalteez/shopify-loyalty-app/issues)
- **Email**: support@loyalteez.app
- **Discord**: [discord.gg/loyalteez](https://discord.gg/loyalteez)

---

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Integrated with [Loyalteez](https://loyalteez.app)
- Compatible with [Shopify](https://shopify.dev)

---

**Ready to launch your loyalty program?** [Get started →](./docs/SETUP.md)

