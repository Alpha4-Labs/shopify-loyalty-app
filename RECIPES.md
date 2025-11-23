# 🧪 Shopify Loyalty Recipes

This guide provides "recipes" for integrating Loyalteez into your Shopify store using the `shopify-loyalty-app`. 

These recipes range from the standard "Purchase Reward" to complex, logic-based incentives.

---

## Level 1: The "Purchase Reward" (Standard)
**Best for:** Every loyalty program. The foundation.

Reward customers for every dollar they spend. This uses the standard `orders/create` webhook.

### Steps
1.  **Shopify Admin**: Create a webhook.
    *   **Event**: `Order creation`
    *   **Format**: `JSON`
    *   **URL**: `https://shopify.loyalteez.app/webhooks/shopify`
    *   **Version**: `2025-10` (Latest)
2.  **Partner Portal**: Go to **Automation -> Templates** and select **E-commerce**.
    *   Ensure the `Place Order` rule is active.
    *   Default logic: 10 LTZ per $1 spent (configurable in Dashboard).
3.  **Result**: Customer buys a $50 item -> Customer gets 500 LTZ.

---

## Level 2: The "Big Spender" Bonus (High Value)
**Best for:** Increasing Average Order Value (AOV).

Give an *extra* flat bonus if the cart total exceeds a certain amount (e.g., $100).

### Code Implementation
In `worker.js`, the logic already exists!
```javascript
const bonus = orderTotal >= 100 ? 1000 : 0;
if (bonus > 0) {
  // Triggers 'shopify_large_order' event
  await sendLoyalteezEvent('shopify_large_order', ...);
}
```

### Steps
1.  **Partner Portal**: Go to **Events**.
2.  **Create Custom Event**:
    *   **Name**: "Big Spender Bonus"
    *   **Event ID**: `shopify_large_order` (Must match code)
    *   **Reward**: 1000 LTZ (or whatever you prefer)
    *   **Cooldown**: 0 (Unlimited)
3.  **Result**:
    *   Order $45 -> Gets standard points (Level 1).
    *   Order $150 -> Gets standard points + **1000 LTZ Bonus**.

---

## Level 3: The "Brand Promoter" (Specific Item)
**Best for:** Promoting a new product line or clearing inventory.

Reward users 2x points or a specific bonus for buying a specific item (e.g., "Golden Sneaker").

### Code Implementation (Modify `worker.js`)
You need to edit `handleOrderCreated` to check `line_items`.

```javascript
// In worker.js -> handleOrderCreated
const hasGoldenSneaker = order.line_items.some(item => 
  item.title.includes("Golden Sneaker") || item.sku === "GOLD-SNKR-001"
);

if (hasGoldenSneaker) {
   await sendLoyalteezEvent('promo_item_bonus', email, brandId, apiUrl, {
     item: "Golden Sneaker"
   });
}
```

### Steps
1.  **Deploy**: Update your worker with the new logic.
2.  **Partner Portal**: Create Custom Event `promo_item_bonus`.
3.  **Result**: Buying the specific item triggers the extra reward.

---

## Level 4: The "Refund Deductor" (Correction)
**Best for:** Preventing abuse and maintaining accurate balances.

If a user returns an item, you might want to tag their account or log the event.

### Steps
1.  **Shopify Admin**: Create a webhook for `Refund creation`.
2.  **Code Implementation**: Add a handler in `worker.js`.
    ```javascript
    // In worker.js -> processWebhook
    if (topic === 'refunds/create') {
       // Logic to handle refund
       // Note: Loyalteez API currently adds points. 
       // Use this to flag users or trigger a 'refund_scan' event for analytics.
       await sendLoyalteezEvent('refund_processed', ...);
    }
    ```
3.  **Result**: You track refunds in your Loyalteez analytics.

---

## Level 5: The "Fulfillment Delight" (Logistics)
**Best for:** Rewarding only when the item actually ships.

Instead of rewarding on *Order Creation* (which can be cancelled), reward on *Fulfillment*.

### Steps
1.  **Shopify Admin**: Create a webhook for `Fulfillment creation`.
2.  **Code Implementation**:
    *   Modify `worker.js` to listen for `fulfillments/create` instead of `orders/create`.
    *   Extract email from the payload (nested under `order`).
3.  **Result**: Points are awarded only when the shipping notification goes out.

---

## Summary of Hooks

| Recipe | Webhook Topic | Complexity | Purpose |
|---|---|---|---|
| **Purchase** | `orders/create` | 🟢 Easy | Base rewards for spending |
| **Bonus** | `orders/create` | 🟡 Medium | Incentivize high AOV |
| **Welcome** | `customers/create` | 🟢 Easy | Sign-up reward |
| **Shipping** | `fulfillments/create` | 🟠 Harder | Reward on ship (safer) |
| **Refund** | `refunds/create` | 🔴 Expert | Abuse prevention |

