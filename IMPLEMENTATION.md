  # Server Implementation Guide - How to Fix Razorpay Auto-Refunds

## What's Included

This repository now includes two PHP API endpoints to fix the Razorpay auto-refund issue:

1. `api/create-order.php` - Creates Razorpay order on server
2. `api/verify-payment.php` - Verifies payment after customer completes payment

## The Problem

Your Razorpay payments are being auto-refunded because:

- No server-side order was created (orders must exist on server BEFORE payment)
- No payment verification (system doesn't know if payment succeeded)
- Emails not being sent reliably

## The Solution

You need to:

1. Deploy these API files to a server (PHP 7.4+)
2. Configure environment variables with your Razorpay keys
3. Update checkout-form.js to use these APIs

## Quick Start

### Option A: Use Render (Recommended - Free)

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect to jioposters-cloud/statusring-store
5. Configure:
   - Name: statusring-api
   - Environment: PHP
   - Build Command: `composer install`
   - Start Command: `php -S 0.0.0.0:$PORT`
6. Add Environment Variables:
   - RAZORPAY_KEY_ID=rzp_live_RycGGdBVVqAFT9
   - RAZORPAY_KEY_SECRET=your_secret_key
7. Deploy

### Option B: Manual Deployment

1. Host with provider that supports PHP
2. Upload `api/` folder
3. Install Razorpay SDK: `composer require razorpay/razorpay`
4. Set environment variables on server

## Files Provided

- **api/create-order.php** - Creates order, returns order_id
- **api/verify-payment.php** - Verifies payment_id with Razorpay

## How It Works

```
1. Customer fills form → Checkout button
2. Client calls api/create-order.php with amount
3. Server creates order in Razorpay
4. Razorpay checkout opens with order_id
5. Customer completes payment
6. Client verifies with api/verify-payment.php
7. If verified → Email sent + Order logged
```
