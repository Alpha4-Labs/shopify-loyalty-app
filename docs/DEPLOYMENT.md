# Deployment Guide

Deploy your Shopify loyalty app to production using Railway, Cloudflare Workers, or any Node.js hosting platform.

---

## Option 1: Railway (Recommended for Beginners)

Railway offers zero-config deployment, free HTTPS, and automatic scaling.

### Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub account (for Git integration)

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Initialize Project

```bash
# In your project directory
railway init
```

This will:
- Create a new Railway project
- Link your local directory to Railway
- Generate a `railway.json` config file

### Step 4: Add Environment Variables

```bash
# Set required variables
railway variables set SHOPIFY_WEBHOOK_SECRET=your_secret
railway variables set SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
railway variables set LOYALTEEZ_API_URL=https://api.loyalteez.xyz
railway variables set NODE_ENV=production

# Optional variables
railway variables set LOYALTEEZ_BRAND_ID=0x0000000000000000000000000000000000000000
railway variables set PORT=3000
```

Or set them in the Railway dashboard:
1. Go to your project
2. Click **Variables**
3. Add each variable

### Step 5: Deploy

```bash
railway up
```

### Step 6: Get Your URL

```bash
railway domain
```

You'll get a URL like: `https://shopify-loyalty-app-production.up.railway.app`

**This is your webhook URL!** Update it in Shopify webhook settings.

### Step 7: Configure Custom Domain (Optional)

1. Go to Railway dashboard → Your project → Settings
2. Click **Generate Domain**
3. Or add a custom domain in **Domains** section

---

## Option 2: Cloudflare Workers (Edge Deployment)

Cloudflare Workers runs on Cloudflare's edge network for ultra-low latency worldwide.

### Prerequisites

- Cloudflare account ([dash.cloudflare.com](https://dash.cloudflare.com))
- Wrangler CLI installed

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate.

### Step 3: Set Secrets

```bash
# Set webhook secret (you'll be prompted to enter the value)
wrangler secret put SHOPIFY_WEBHOOK_SECRET

# Optional: Set other secrets
wrangler secret put LOYALTEEZ_BRAND_ID
wrangler secret put LOYALTEEZ_API_URL
```

### Step 4: Deploy

```bash
wrangler publish
```

You'll get a URL like: `https://shopify-loyalty-app.your-username.workers.dev`

### Step 5: Configure Routes (Optional)

For custom domains:

1. Go to Cloudflare dashboard → Workers & Pages
2. Select your worker
3. Go to **Settings → Routes**
4. Add custom domain

---

## Option 3: Heroku

### Prerequisites

- Heroku account ([heroku.com](https://heroku.com))
- Heroku CLI installed

### Step 1: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

### Step 2: Login

```bash
heroku login
```

### Step 3: Create App

```bash
heroku create shopify-loyalty-app
```

### Step 4: Set Environment Variables

```bash
heroku config:set SHOPIFY_WEBHOOK_SECRET=your_secret
heroku config:set SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
heroku config:set LOYALTEEZ_API_URL=https://api.loyalteez.xyz
heroku config:set NODE_ENV=production
```

### Step 5: Deploy

```bash
git push heroku main
```

### Step 6: Get URL

```bash
heroku open
```

Or check: `https://shopify-loyalty-app.herokuapp.com`

---

## Option 4: DigitalOcean App Platform

### Step 1: Create App

1. Go to [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Connect your GitHub repository
4. Select your repository and branch

### Step 2: Configure Build Settings

- **Build Command**: `npm install`
- **Run Command**: `npm start`
- **Environment**: Node.js

### Step 3: Add Environment Variables

In the app settings, add:
- `SHOPIFY_WEBHOOK_SECRET`
- `SHOPIFY_SHOP_DOMAIN`
- `LOYALTEEZ_API_URL`
- `NODE_ENV=production`

### Step 4: Deploy

Click **Create Resources** and wait for deployment.

---

## Option 5: Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy

```bash
vercel --prod
```

### Step 3: Set Environment Variables

In Vercel dashboard → Your project → Settings → Environment Variables

---

## Post-Deployment Checklist

After deploying, verify:

- [ ] Health endpoint works: `https://your-app-url.com/health`
- [ ] Webhook endpoint accessible: `https://your-app-url.com/webhooks/shopify`
- [ ] Environment variables set correctly
- [ ] Shopify webhook URL updated
- [ ] Test with a real order
- [ ] Check logs for errors

---

## Monitoring

### Health Checks

Set up monitoring for your health endpoint:

- **UptimeRobot**: [uptimerobot.com](https://uptimerobot.com)
- **Pingdom**: [pingdom.com](https://pingdom.com)
- **StatusCake**: [statuscake.com](https://statuscake.com)

Monitor: `https://your-app-url.com/health`

### Logs

**Railway:**
```bash
railway logs
```

**Cloudflare Workers:**
```bash
wrangler tail
```

**Heroku:**
```bash
heroku logs --tail
```

---

## Troubleshooting

### Deployment Fails

**Check:**
- [ ] Node.js version compatible (18+)
- [ ] All dependencies in `package.json`
- [ ] Build command correct
- [ ] Environment variables set

### Webhooks Not Working After Deployment

**Check:**
- [ ] Webhook URL updated in Shopify
- [ ] Server is running and accessible
- [ ] Environment variables set correctly
- [ ] Check server logs for errors

### SSL/HTTPS Issues

Most platforms provide HTTPS automatically:
- Railway: ✅ Automatic
- Cloudflare Workers: ✅ Automatic
- Heroku: ✅ Automatic
- DigitalOcean: ✅ Automatic

If using custom domain, ensure SSL is configured.

---

## Scaling Considerations

### Railway

- Automatically scales based on traffic
- Free tier: 500 hours/month
- Paid plans: Unlimited

### Cloudflare Workers

- Edge deployment (runs worldwide)
- Free tier: 100,000 requests/day
- Paid plans: Higher limits

### Heroku

- Free tier: Limited hours
- Paid dynos: Scale as needed

---

## Cost Comparison

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| Railway | 500 hours/month | $5+/month |
| Cloudflare Workers | 100K requests/day | $5+/month |
| Heroku | 550-1000 hours/month | $7+/month |
| DigitalOcean | None | $5+/month |
| Vercel | Generous free tier | $20+/month |

---

## Recommended Setup

**For beginners:** Railway (easiest setup)  
**For performance:** Cloudflare Workers (edge deployment)  
**For flexibility:** Heroku or DigitalOcean

---

## Need Help?

- **Documentation**: [docs.loyalteez.app](https://docs.loyalteez.app)
- **Issues**: [GitHub Issues](https://github.com/loyalteez/shopify-loyalty-app/issues)
- **Email**: support@loyalteez.app

