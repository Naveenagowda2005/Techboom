# Campaign System - Complete Implementation

## Overview
The influencer campaign system is now fully functional, allowing admins to create campaigns and referrers to browse, join, and participate in them.

## Features Implemented

### 1. Database Schema
- **CampaignParticipant Model**: Tracks which referrers have joined which campaigns
  - Stores earnings and referral count per campaign
  - Tracks participation status (ACTIVE, COMPLETED, WITHDRAWN)
  - Unique constraint prevents duplicate joins

### 2. Admin Features
- **Create Campaigns**: Title, description, budget, platforms, status, dates
- **Edit Campaigns**: Update campaign details
- **Delete Campaigns**: Remove campaigns (cascades to participants)
- **View Participants**: See how many referrers joined each campaign
- **Campaign Status**: DRAFT, ACTIVE, PAUSED, COMPLETED

### 3. Referrer Features
- **Browse Campaigns**: View all active campaigns
- **Filter by Platform**: Instagram, YouTube, Facebook, Twitter, TikTok, LinkedIn
- **Join Campaigns**: One-click join for active campaigns
- **Leave Campaigns**: Withdraw from campaigns
- **My Campaigns Tab**: View all joined campaigns with earnings and stats
- **Campaign Details Modal**: View full campaign information

### 4. API Endpoints

#### Admin Endpoints
- `GET /api/campaigns` - List all campaigns (with participant count)
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/[id]` - Get campaign details
- `PUT /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign

#### Referrer Endpoints
- `GET /api/campaigns/available` - List active campaigns (with join status)
- `GET /api/campaigns/my-campaigns` - List joined campaigns
- `POST /api/campaigns/[id]/join` - Join a campaign
- `POST /api/campaigns/[id]/leave` - Leave a campaign

### 5. UI Components
- **Admin Campaigns Page**: `/admin/campaigns`
  - Full CRUD operations
  - Participant count display
  - Platform badges
  - Status indicators

- **Referrer Campaigns Page**: `/dashboard/campaigns`
  - Two tabs: Available Campaigns, My Campaigns
  - Platform filter
  - Campaign cards with join/leave buttons
  - Details modal
  - Earnings and referral tracking

### 6. Navigation
- Added "Campaigns" menu item to referrer sidebar (🎯 icon)
- Positioned between "Referrals" and "Earnings"

## How It Works

### For Admins:
1. Go to `/admin/campaigns`
2. Click "+ Add Campaign"
3. Fill in campaign details (title, description, budget, platforms, dates)
4. Select at least one platform
5. Set status (DRAFT for testing, ACTIVE for live)
6. Click "Create Campaign"
7. View participant count in the campaigns table

### For Referrers:
1. Go to `/dashboard/campaigns`
2. Browse available campaigns or filter by platform
3. Click "View Details" to see full campaign info
4. Click "Join Campaign" to participate
5. Switch to "My Campaigns" tab to see joined campaigns
6. Track earnings and referrals per campaign
7. Click "Leave" to withdraw from a campaign

## Database Changes
- Added `CampaignParticipant` table
- Added relation to `User` model
- Added relation to `InfluencerCampaign` model
- Migration applied: `20260407122412_add_campaign_participants`

## Validation & Security
- Only referrers (USER role) can join campaigns
- Only ACTIVE campaigns can be joined
- Prevents duplicate joins (unique constraint)
- Authorization checks for edit/delete operations
- Platform selection required (minimum 1)

## Future Enhancements (Optional)
- Campaign-specific referral links
- Track orders from campaign referrals
- Automatic earnings calculation
- Campaign performance analytics
- Email notifications for new campaigns
- Campaign application/approval workflow
- Campaign rewards/bonuses

## Testing
1. Login as admin (admin@techboom.in / Admin@123)
2. Create a campaign with status ACTIVE
3. Login as referrer (demo@techboom.in / User@123)
4. Browse campaigns and join one
5. Check "My Campaigns" tab
6. Verify participant count in admin panel

## Files Modified/Created
- `prisma/schema.prisma` - Added CampaignParticipant model
- `app/api/campaigns/route.ts` - Added participant count
- `app/api/campaigns/[id]/route.ts` - Fixed update endpoint
- `app/api/campaigns/[id]/join/route.ts` - New join endpoint
- `app/api/campaigns/[id]/leave/route.ts` - New leave endpoint
- `app/api/campaigns/available/route.ts` - New available campaigns endpoint
- `app/api/campaigns/my-campaigns/route.ts` - New my campaigns endpoint
- `app/(dashboard)/dashboard/campaigns/page.tsx` - New referrer campaigns page
- `app/(dashboard)/admin/campaigns/page.tsx` - Updated admin page
- `components/dashboard/Sidebar.tsx` - Added campaigns menu item

## Status
✅ Complete and ready to use!
