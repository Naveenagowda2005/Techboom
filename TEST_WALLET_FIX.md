# Testing Wallet Balance Fix

## Test Scenario

### Setup
1. Login as a referrer (USER role)
2. Check current wallet balance and total earnings

### Test 1: New Order Completion
1. Have a customer place an order using your referral code
2. Login as admin
3. Mark the order as COMPLETED
4. Go back to referrer dashboard
5. **Expected**: Wallet balance should increase by 10% of order amount

### Test 2: Admin Marks as Paid
1. Login as admin
2. Go to Referrals page
3. Find an unpaid commission
4. Click "Mark as Paid"
5. Login as referrer
6. Check wallet page
7. **Expected**: 
   - Wallet balance should decrease by the paid amount
   - Total earnings (Paid Out) should increase by the paid amount
   - Transaction should appear in history

### Test 3: Verify Calculations
1. Login as referrer
2. Go to Wallet page
3. Note the "Wallet Balance" and "Paid Out" amounts
4. Go to Referrals page (if available)
5. **Expected**:
   - Wallet Balance = Sum of all unpaid commissions
   - Paid Out = Sum of all transaction records

### Test 4: Dashboard Overview
1. Login as referrer
2. Check dashboard overview page
3. **Expected**:
   - Wallet Balance should match the wallet page
   - Total Earnings should show sum of paid commissions
   - No negative values should appear

## What Was Fixed

### Before (Broken)
- Order completes → Nothing happens to wallet
- Admin marks as paid → Wallet decreases
- Result: Negative balance for old paid orders

### After (Fixed)
- Order completes → Referral created with isPaid=false
- Wallet balance = Sum of unpaid referrals (calculated dynamically)
- Admin marks as paid → isPaid=true, transaction created
- Wallet balance automatically updates (recalculated)
- Result: Always accurate, never negative

## Quick Verification Commands

If you have database access, you can verify:

```sql
-- Check unpaid commissions for a user
SELECT SUM(commissionAmount) as wallet_balance
FROM "Referral"
WHERE referrerId = '[USER_ID]' AND isPaid = false;

-- Check paid commissions for a user
SELECT SUM(amount) as total_earnings
FROM "Transaction"
WHERE userId = '[USER_ID]' AND type = 'COMMISSION';
```
