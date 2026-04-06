# Razorpay Payment Integration Guide

## Current Status
✅ Order creation is working
⏳ Razorpay payment integration is temporarily disabled (waiting for valid API credentials)

## What's Working Now
- Customers can browse services
- Customers can place orders (order gets created in database with PENDING status)
- Orders are tracked in the database
- Admin can view orders in the admin panel

## What's Needed for Razorpay Integration

### Step 1: Get Valid Razorpay Credentials

1. Go to https://dashboard.razorpay.com/
2. Sign in to your account
3. In the left sidebar, click on "Test Mode" (near the bottom)
4. Then go to "Account & Settings" (gear icon) → "API Keys"
5. You should see or be able to generate:
   - **Key ID** (starts with `rzp_test_` for test mode)
   - **Key Secret** (click "Generate Test Key" if needed)

### Step 2: Update Environment Variables

Once you have valid credentials, update `.env.local`:

```env
RAZORPAY_KEY_ID="rzp_test_YOUR_ACTUAL_KEY_ID"
RAZORPAY_KEY_SECRET="your_actual_key_secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_YOUR_ACTUAL_KEY_ID"
```

### Step 3: Restart the Server

```bash
npm run dev
```

### Step 4: Enable Payment Flow

Once you have valid credentials and the server is restarted, I can re-enable the full Razorpay payment flow which includes:
- Creating Razorpay payment order
- Opening Razorpay payment modal
- Processing payment
- Verifying payment signature
- Updating order status to COMPLETED

## Test Mode vs Live Mode

### Test Mode (Current)
- Use test credentials (`rzp_test_...`)
- No real money is charged
- Use test card numbers for testing
- Test cards: https://razorpay.com/docs/payments/payments/test-card-details/

### Live Mode (Production)
- Use live credentials (`rzp_live_...`)
- Real money transactions
- Requires KYC verification
- Switch when ready to go live

## Common Issues

### "Authentication failed" Error
- Credentials are invalid or expired
- Wrong mode (test vs live) credentials
- Credentials not properly loaded (restart server after updating .env.local)

### CSP Errors in Browser Console
- Already fixed in middleware.ts
- Allows all necessary Razorpay domains

## Files Modified for Payment Integration

1. `app/api/payments/create-order/route.ts` - Creates Razorpay order
2. `app/api/payments/verify/route.ts` - Verifies payment signature
3. `app/(dashboard)/dashboard/services/page.tsx` - Customer order flow
4. `middleware.ts` - CSP headers for Razorpay
5. `.env.local` - Environment variables

## Next Steps

1. Get valid test credentials from Razorpay dashboard
2. Update `.env.local` with new credentials
3. Restart server
4. Let me know and I'll re-enable the full payment flow
5. Test with Razorpay test cards
6. When ready for production, switch to live credentials
