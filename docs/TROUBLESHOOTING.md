# Troubleshooting Guide

Common issues and solutions for the Shopify Loyalty App.

---

## Webhooks Not Received

### Symptoms
- No webhook logs in server console
- Orders placed but no rewards distributed
- Shopify webhook delivery shows failures

### Solutions

**1. Check Server Status**
```bash
# Check if server is running
curl http://localhost:3000/health

# Should return: {"status":"healthy",...}
```

**2. Verify Webhook URL**
- In Shopify admin: Settings → Notifications → Webhooks
- Ensure URL matches your deployed endpoint
- For local testing, use ngrok or similar tunnel

**3. Check Public Accessibility**
- Server must be publicly accessible (not `localhost`)
- Check firewall settings
- Verify HTTPS is enabled (required by Shopify)

**4. Test Webhook Manually**
```bash
# Use curl to test endpoint
curl -X POST https://your-app-url.com/webhooks/shopify \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: orders/create" \
  -H "X-Shopify-Shop-Domain: your-store.myshopify.com" \
  -d @examples/sample-order-webhook.json
```

---

## "Invalid Webhook Signature" Error

### Symptoms
- 401 Unauthorized responses
- Error logs: "Invalid webhook signature"
- Webhooks rejected by server

### Solutions

**1. Verify Webhook Secret**
```bash
# Check environment variable is set
echo $SHOPIFY_WEBHOOK_SECRET

# Or in code (temporary debug)
console.log('Secret exists:', !!process.env.SHOPIFY_WEBHOOK_SECRET);
```

**2. Check Secret Format**
- Secret should be a long string (usually 32+ characters)
- No extra spaces or quotes
- Copied correctly from Shopify admin

**3. Verify Raw Body Handling**
- Ensure `body-parser` preserves raw body
- Check `server.js` has the `verify` function
- Don't modify request body before verification

**4. Test Signature Verification**
```javascript
// Add temporary debug logging
const isValid = verifyShopifyWebhook(req, process.env.SHOPIFY_WEBHOOK_SECRET);
console.log('Signature valid:', isValid);
console.log('HMAC header:', req.headers['x-shopify-hmac-sha256']);
```

---

## Loyalteez API Errors

### Symptoms
- Error logs: "Loyalteez API error"
- Events not appearing in Loyalteez dashboard
- 500 errors from Loyalteez API

### Solutions

**1. Check API URL**
```bash
# Verify API URL is correct
# Testnet: https://api.loyalteez.xyz
# Mainnet: https://api.loyalteez.app

curl https://api.loyalteez.xyz/loyalteez-api/health
```

**2. Verify Event Format**
- Check `eventType` matches rules in Loyalteez dashboard
- Ensure `userEmail` is valid email format
- Verify `brandId` is correct (or placeholder for testnet)

**3. Check Reward Rules**
- Log into Loyalteez dashboard
- Go to Rules section
- Ensure rules exist for:
  - `shopify_purchase`
  - `shopify_signup`
  - `shopify_large_order`

**4. Test API Directly**
```bash
# Test manual event
curl -X POST https://api.loyalteez.xyz/loyalteez-api/manual-event \
  -H "Content-Type: application/json" \
  -d '{
    "brandId": "0x0000000000000000000000000000000000000000",
    "eventType": "test_reward",
    "userEmail": "test@example.com",
    "domain": "shopify-store"
  }'
```

---

## Rewards Not Showing in Customer Balance

### Symptoms
- Webhook processed successfully
- No errors in logs
- But customer balance unchanged

### Solutions

**1. Check Event Processing**
- Verify webhook was received and processed
- Check server logs for "✅ Rewarded" messages
- Verify Loyalteez API returned success

**2. Check Reward Rules**
- Ensure rules have "Auto-approve" enabled
- Verify reward amounts are configured
- Check rule conditions (e.g., minimum order amount)

**3. Verify Customer Email**
- Ensure email matches in Shopify and Loyalteez
- Check for typos or case sensitivity
- Verify email format is valid

**4. Check Processing Time**
- Rewards may take 30-60 seconds to process
- Check Loyalteez dashboard → Analytics
- Look for pending events

---

## Duplicate Rewards

### Symptoms
- Customer receives rewards multiple times
- Same order processed multiple times
- Duplicate events in logs

### Solutions

**1. Check Webhook Subscriptions**
- Ensure only one webhook per event type
- Don't subscribe to both `orders/create` and `orders/paid` for same reward
- Remove duplicate webhooks

**2. Add Idempotency**
```javascript
// Add order ID tracking (example)
const processedOrders = new Set();

async function handleOrderCreated(order) {
  if (processedOrders.has(order.id)) {
    console.log('Order already processed, skipping');
    return;
  }
  
  processedOrders.add(order.id);
  // Process order...
}
```

**3. Check Shopify Webhook Retries**
- Shopify retries failed webhooks
- Ensure your server responds with 200 OK
- Don't process same order twice

---

## Server Crashes or Errors

### Symptoms
- Server stops responding
- 500 errors
- Process exits unexpectedly

### Solutions

**1. Check Error Logs**
```bash
# View recent logs
railway logs  # Railway
wrangler tail  # Cloudflare Workers
heroku logs --tail  # Heroku
```

**2. Check Memory Usage**
```bash
# Check health endpoint
curl https://your-app-url.com/health

# Look for memory usage
```

**3. Verify Environment Variables**
```bash
# Check all required variables are set
railway variables  # Railway
heroku config  # Heroku
```

**4. Test Locally**
```bash
# Run locally to debug
npm run dev

# Check for errors in console
```

---

## CORS Errors

### Symptoms
- Browser console shows CORS errors
- Requests blocked by browser
- "Access-Control-Allow-Origin" errors

### Solutions

**1. Check CORS Headers**
- Webhook endpoints don't need CORS (server-to-server)
- Only needed for browser requests
- Verify headers in `worker.js` (Cloudflare Workers)

**2. Test Endpoint**
```bash
# Test CORS preflight
curl -X OPTIONS https://your-app-url.com/webhooks/shopify \
  -H "Origin: https://your-store.myshopify.com" \
  -v
```

---

## Performance Issues

### Symptoms
- Slow webhook processing
- Timeouts
- High latency

### Solutions

**1. Optimize Response Time**
- Respond to Shopify immediately (< 5 seconds)
- Process webhooks asynchronously
- Use background jobs for slow operations

**2. Check API Timeouts**
```javascript
// Increase timeout if needed
const response = await axios.post(url, data, {
  timeout: 15000 // 15 seconds
});
```

**3. Monitor Performance**
- Set up monitoring (UptimeRobot, etc.)
- Track response times
- Alert on slow responses

---

## Still Having Issues?

### Get Help

1. **Check Logs**: Always check server logs first
2. **Test Manually**: Use curl to test endpoints
3. **Verify Configuration**: Double-check all environment variables
4. **Check Documentation**: Review [SETUP.md](./SETUP.md) and [DEPLOYMENT.md](./DEPLOYMENT.md)

### Support Channels

- **GitHub Issues**: [github.com/loyalteez/shopify-loyalty-app/issues](https://github.com/loyalteez/shopify-loyalty-app/issues)
- **Email**: support@loyalteez.app
- **Discord**: [discord.gg/loyalteez](https://discord.gg/loyalteez)
- **Documentation**: [docs.loyalteez.app](https://docs.loyalteez.app)

---

## Debug Checklist

When reporting issues, include:

- [ ] Server logs (with sensitive data redacted)
- [ ] Environment (development/production)
- [ ] Deployment platform (Railway/Cloudflare/Heroku)
- [ ] Node.js version
- [ ] Error messages (full stack trace)
- [ ] Steps to reproduce
- [ ] Expected vs actual behavior

