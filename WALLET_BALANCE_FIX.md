# Wallet Balance Logic Fix

## Problem
The wallet balance was showing incorrect values (negative or zero) because it was being stored in the database and manipulated incorrectly:
- When order completed → No wallet update (correct)
- When admin marked as paid → Wallet balance decreased (wrong approach)
- This caused negative balances for existing paid commissions

## Solution
Changed from **stored balance** to **dynamically calculated balance**:

### New Logic
1. **Wallet Balance** = SUM of unpaid commissions (referrals where `isPaid = false`)
2. **Total Earnings** = SUM of paid commissions (referrals where `isPaid = true`)
3. When order completes → Create referral record with `isPaid = false`
4. When admin marks as paid → Set `isPaid = true`, create transaction record
5. No more database updates to `user.walletBalance` field

## Files Changed

### 1. `/api/auth/me/route.ts`
- Now calculates `walletBalance` dynamically from unpaid referrals
- Queries all referrals where `isPaid = false` and sums commission amounts

### 2. `/api/dashboard/stats/route.ts`
- Calculates `walletBalance` from unpaid referrals
- Calculates `totalEarnings` from paid referrals (transactions)
- No longer reads `user.walletBalance` from database

### 3. `/api/referrals/mark-paid/route.ts`
- Removed `user.update` that decremented wallet balance
- Now only sets `referral.isPaid = true` and creates transaction record
- Transaction record serves as proof of payment

### 4. `/app/(dashboard)/dashboard/wallet/page.tsx`
- Removed `Math.max(0, balance)` workaround
- Changed label from "Current balance" to "Unpaid commissions"
- Now displays actual calculated balance

### 5. `/app/(dashboard)/dashboard/page.tsx`
- Removed `Math.max(0, stats?.walletBalance || 0)` workaround
- Now displays actual calculated balance

## How It Works Now

### Order Completion Flow
```
1. Customer places order with referral code
2. Admin marks order as COMPLETED
3. System creates Referral record:
   - referrerId: [referrer's user ID]
   - orderId: [order ID]
   - commissionAmount: order.amount * 0.10
   - isPaid: false
4. Wallet balance automatically increases (calculated from unpaid referrals)
```

### Payment Flow
```
1. Admin views referrals page
2. Admin clicks "Mark as Paid" for a referral
3. System updates:
   - Sets referral.isPaid = true
   - Creates Transaction record (proof of payment)
4. Wallet balance automatically decreases (calculated from unpaid referrals)
5. Total earnings increases (calculated from paid referrals)
```

## Benefits
- ✅ Wallet balance always accurate (calculated, not stored)
- ✅ No negative balances
- ✅ Easy to audit (just query referrals table)
- ✅ Transaction records serve as payment proof
- ✅ No complex balance reconciliation needed

## Database Field Note
The `user.walletBalance` field still exists in the schema but is no longer used. It can be removed in a future migration if desired, but keeping it doesn't cause issues since we calculate the balance dynamically.
