# Referral Discount System - Implementation Status

## ✅ Completed

### Database Schema
- Added `firstOrderDiscount` field to User model (percentage)
- Added `hasUsedFirstOrderDiscount` field to User model (boolean)
- Added Settings model with `referralDiscountPercent` (default 20%)
- Added Settings model with `referralCommissionPercent` (default 10%)

### Admin Features
- Settings page at `/admin/settings` to change discount %
- Live preview of how discounts work
- Example calculation showing customer savings and referrer earnings

### Registration
- When user signs up with referral code, `firstOrderDiscount` is set from Settings
- Discount percentage is fetched from Settings table
- User's `hasUsedFirstOrderDiscount` is set to false

### Referrals Tracking
- Shows total signups (people who registered)
- Shows total orders (only completed orders)
- Shows conversion rate
- Shows list of referred users with their order status
- Only counts completed orders in earnings

## ⏳ Still To Implement

### 1. Show Discount to Customer
- Add banner on customer dashboard showing available discount
- Show discount on services booking page
- Display "You have X% off your first order!" message

### 2. Apply Discount on Order Creation
- Check if user has `firstOrderDiscount > 0` and `hasUsedFirstOrderDiscount = false`
- Calculate discount amount
- Apply discount to order total
- Store original amount and discounted amount

### 3. Mark Discount as Used
- After first order is created, set `hasUsedFirstOrderDiscount = true`
- Prevent discount from being used again

### 4. Show Discount in Order Details
- Display original price
- Display discount applied
- Display final price paid

## Implementation Steps Needed

### Step 1: Update Order Creation API
File: `app/api/orders/route.ts`

```typescript
// Check for first order discount
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { firstOrderDiscount: true, hasUsedFirstOrderDiscount: true }
})

let discountAmount = 0
if (user && user.firstOrderDiscount > 0 && !user.hasUsedFirstOrderDiscount) {
  discountAmount = (amount * user.firstOrderDiscount) / 100
}

const finalAmount = amount - discountAmount

// Create order with discount info
const order = await prisma.order.create({
  data: {
    // ... other fields
    amount: finalAmount,
    // Store discount info in a JSON field or separate fields
  }
})

// Mark discount as used
if (discountAmount > 0) {
  await prisma.user.update({
    where: { id: userId },
    data: { hasUsedFirstOrderDiscount: true }
  })
}
```

### Step 2: Add Discount Banner to Dashboard
File: `app/(dashboard)/dashboard/page.tsx`

Show banner if `user.firstOrderDiscount > 0 && !user.hasUsedFirstOrderDiscount`

### Step 3: Show Discount on Services Page
File: `app/(dashboard)/dashboard/services/page.tsx`

Display discount badge on service cards

## Current Discount Flow

1. **User signs up with referral link** → `firstOrderDiscount` = 20% (from Settings)
2. **User sees discount banner** → "Get 20% off your first order!"
3. **User books service** → Discount applied automatically
4. **Order created** → `hasUsedFirstOrderDiscount` = true
5. **Referrer earns commission** → 10% of order amount (from Settings)

## Testing Checklist

- [ ] Admin can change discount % in Settings
- [ ] New referred user gets discount set on signup
- [ ] Customer sees discount banner on dashboard
- [ ] Discount is applied on first order
- [ ] Discount is NOT applied on second order
- [ ] Referrer sees signup immediately
- [ ] Referrer sees commission after order completes
- [ ] Only completed orders count in stats

## Notes

- Discount is stored per-user, not globally
- Each referred user can have different discount % (based on Settings at signup time)
- Discount is only for FIRST order
- Commission is calculated on the ORIGINAL amount (before discount)
