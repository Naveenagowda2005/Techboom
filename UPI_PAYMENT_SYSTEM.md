# UPI Payment System for Referral Commissions

## Overview
Changed the withdrawal system so referrers submit their UPI ID, which admins can see before making payments and marking commissions as paid.

## Changes Made

### 1. Database Schema (`prisma/schema.prisma`)
- Added `upiId` field to User model (nullable String)
- Migration created: `20260408055019_add_upi_id_to_user`

### 2. New API Endpoint
**`/api/users/update-upi` (POST)**
- Allows users to save/update their UPI ID
- Validates UPI ID format (username@bank)
- Returns updated user data

### 3. Wallet Page Updates (`app/(dashboard)/dashboard/wallet/page.tsx`)
**Before:**
- Showed bank account and IFSC code fields
- "Withdraw Funds" button

**After:**
- Shows UPI ID submission form
- Displays current UPI ID if saved
- Warning message if no UPI ID provided
- "Add/Update UPI ID" button
- Format validation (must contain @)

### 4. Admin Referrals Page Updates (`app/(dashboard)/admin/referrals/page.tsx`)
**Main Table:**
- Shows UPI ID below referrer email in each row
- Warning indicator if referrer has pending commission but no UPI ID

**Details Modal:**
- Shows UPI ID prominently at the top
- "No UPI ID provided yet" warning if missing
- "Mark Paid" button only enabled if UPI ID exists
- Shows "No UPI ID" badge instead of button if missing

### 5. Referrals API Updates (`app/api/referrals/route.ts`)
- Includes `upiId` field when fetching referrer information
- Admin view now shows UPI ID for all referrers

## User Flow

### For Referrers (Users earning commissions):
1. Go to Wallet page
2. Click "Add UPI ID" button
3. Enter UPI ID (e.g., username@paytm, user@ybl)
4. Click "Save UPI ID"
5. UPI ID is now visible to admin for payments

### For Admin:
1. Go to Admin Referrals page
2. See all referrers with their UPI IDs in the table
3. Click "View Details" on a referrer
4. See UPI ID at the top of the modal
5. For each pending commission:
   - If UPI ID exists: "Mark Paid" button is available
   - If no UPI ID: "No UPI ID" badge shown instead
6. Click "Mark Paid" after transferring money to the UPI ID
7. Transaction record is created for the referrer

## Benefits

1. **Simplified Payment Process**: No need for bank account numbers and IFSC codes
2. **Instant Payments**: UPI allows instant transfers
3. **Better UX**: Single field instead of multiple bank details
4. **Admin Visibility**: Admin can see payment details before marking as paid
5. **Payment Proof**: Transaction records created when marked as paid
6. **Safety**: Admin can't mark as paid without UPI ID

## UPI ID Format
- Must contain @ symbol
- Format: `username@bank`
- Examples:
  - `john@paytm`
  - `user@ybl` (Google Pay)
  - `name@oksbi` (SBI)
  - `user@axisbank`

## Files Modified
1. `prisma/schema.prisma` - Added upiId field
2. `app/api/users/update-upi/route.ts` - New API endpoint
3. `app/(dashboard)/dashboard/wallet/page.tsx` - UPI submission form
4. `app/(dashboard)/admin/referrals/page.tsx` - Show UPI ID and conditional Mark Paid
5. `app/api/referrals/route.ts` - Include UPI ID in response

## Migration
```bash
npx prisma migrate dev --name add_upi_id_to_user
```

## Testing
1. Login as a USER (referrer)
2. Go to Wallet page
3. Add UPI ID
4. Login as ADMIN
5. Go to Referrals page
6. Verify UPI ID is visible
7. Try marking commission as paid (should work)
8. Check referrer's wallet for transaction record
