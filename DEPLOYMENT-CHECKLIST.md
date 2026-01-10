  # Razorpay Auto-Refund Fix - Deployment Checklist

## Files Created
✅ api/create-order.php - Server-side order creation
✅ api/verify-payment.php - Payment verification
✅ api/webhook.php - Webhook handler for automatic processing

## Step 1: Deploy on Render.com (5 minutes)

- [ ] Go to https://render.com → Sign up with GitHub
- [ ] Click "New" → "Web Service"
- [ ] Select repository: jioposters-cloud/statusring-store
- [ ] Configure:
  - Name: statusring-api
  - Environment: PHP
  - Build Command: `composer install`
  - Start Command: `php -S 0.0.0.0:$PORT`
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (2-3 min)
- [ ] Copy your URL: https://statusring-api.onrender.com

## Step 2: Add Environment Variables (2 minutes)

- [ ] In Render dashboard, go to your web service
- [ ] Click "Environment"
- [ ] Add variables:
  ```
  RAZORPAY_KEY_ID = rzp_live_RycGGdBVVqAFT9
  RAZORPAY_KEY_SECRET = (from Razorpay dashboard - Settings > API Keys)
  FORMSPREE_ID = mdakrrab
  ```
- [ ] Save and redeploy

## Step 3: Setup Razorpay Webhooks (3 minutes)

- [ ] Go to https://dashboard.razorpay.com
- [ ] Settings → Webhooks
- [ ] Click "Add New Webhook"
- [ ] URL: `https://statusring-api.onrender.com/api/webhook.php`
- [ ] Subscribe to events:
  - [ ] payment.authorized
  - [ ] payment.failed
- [ ] Click "Add Webhook"

## Step 4: IP Whitelist (Optional but Recommended)

- [ ] Razorpay Dashboard → Settings → API Keys
- [ ] IP Whitelist: Add Render's IP (Render will show it)
- [ ] Only your Render server can use the key

## Step 5: Update Frontend Code

Update your checkout-form.js to use the server:

```javascript
// 1. Create order
const orderRes = await fetch('https://statusring-api.onrender.com/api/create-order.php', {
  method: 'POST',
  body: JSON.stringify({ amount: totalAmount })
});
const { order_id } = await orderRes.json();

// 2. Open Razorpay with order_id
const options = {
  key: 'rzp_live_RycGGdBVVqAFT9',
  amount: totalAmount * 100,
  currency: 'INR',
  order_id: order_id,
  handler: function(response) {
    // Verify payment
    fetch('https://statusring-api.onrender.com/api/verify-payment.php', {
      method: 'POST',
      body: JSON.stringify({
        payment_id: response.razorpay_payment_id,
        order_id: order_id
      })
    });
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

## Step 6: Test

- [ ] Use Razorpay test card: 4111111111111111
- [ ] Check email for confirmation
- [ ] Verify payment in Razorpay dashboard
- [ ] Confirm NO auto-refunds

## What This Does

✓ Creates order server-side (FIXES auto-refunds)
✓ Verifies payment with Razorpay
✓ Sends email confirmation via Formspree
✓ Secure secret key storage
✓ Double verification via webhooks
