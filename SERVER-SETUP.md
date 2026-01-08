SERVER-SETUP.md  # Server Setup Guide - StatusRing Store

## Problem Analysis

Razorpay auto-refunds occur because:
1. No server-side order creation
2. No payment verification
3. Missing webhook handling

## Solution: Deploy Backend Server

You need a server to:
- Create Razorpay orders
- Verify payments
- Send emails
- Log orders to Google Sheets

## Quick Setup (Recommended)

Deploy Node.js server to Vercel or Render for free.

## Files Provided

See server/ folder for complete implementation.
