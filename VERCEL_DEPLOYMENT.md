# Deploy Techboom to Vercel (Full-Stack App)

## Important: Vercel Deploys BOTH Frontend AND Backend!

Your Techboom app is a **full-stack Next.js application**. When you deploy to Vercel, it deploys:

✅ **Frontend**: All React pages and components
✅ **Backend**: All API routes in `app/api/` folder
✅ **Database**: Connects to your Neon PostgreSQL database
✅ **Authentication**: JWT-based auth system
✅ **Payment Processing**: Razorpay integration
✅ **File Uploads**: Cloudinary integration

**Your Backend APIs (Already Built):**
- `/api/auth/*` - Login, signup, logout, JWT refresh
- `/api/users/*` - User management (CRUD)
- `/api/services/*` - Services management
- `/api/products/*` - Products management
- `/api/orders/*` - Order processing
- `/api/payments/*` - Razorpay payment handling
- `/api/referrals/*` - Referral system
- `/api/campaigns/*` - Campaign management
- `/api/dashboard/*` - Dashboard statistics
- `/api/upload/*` - File upload to Cloudinary

All of these backend APIs will work on Vercel!

## Why Vercel?
- Built by the Next.js team - perfect compatibility
- Deploys FULL-STACK Next.js apps (frontend + backend)
- Environment variables work flawlessly
- Automatic deployments from GitHub
- Free tier is generous
- Better performance than AWS Amplify for Next.js
- Serverless functions for all API routes

## Step-by-Step Deployment

### 1. Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with your GitHub account (same one with Techboom repo)

### 2. Import Your Project
1. After signing in, click "Add New..." → "Project"
2. Vercel will show your GitHub repositories
3. Find "Techboom" and click "Import"

### 3. Configure Project
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `techboom-app` (IMPORTANT!)
3. **Build Command**: Leave default (`npm run build`)
4. **Output Directory**: Leave default (`.next`)
5. Click "Environment Variables" to expand

### 4. Add Environment Variables
Copy-paste each variable (click "Add" after each one):

```
DATABASE_URL
postgresql://neondb_owner:npg_Vq72TSCxcZmj@ep-aged-cloud-ancpsk8y-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_ACCESS_SECRET
a8f5e2c9b1d4f7e3a6c8b2d5f9e1c4a7b3d6f8e2c5a9b1d4f7e3a6c8b2d5f9e1

JWT_REFRESH_SECRET
c4a7b3d6f8e2c5a9b1d4f7e3a6c8b2d5f9e1c4a7b3d6f8e2c5a9b1d4f7e3a6c8

JWT_ACCESS_EXPIRES
15m

JWT_REFRESH_EXPIRES
7d

RAZORPAY_KEY_ID
rzp_test_SZN1g8S6MYedgj

RAZORPAY_KEY_SECRET
2u73oCIdISaMlIMF9KR9dpzx

NEXT_PUBLIC_RAZORPAY_KEY_ID
rzp_test_SZN1g8S6MYedgj

CLOUDINARY_CLOUD_NAME
dp9xrfznz

CLOUDINARY_API_KEY
772476517938521

CLOUDINARY_API_SECRET
DA6Z8huFta4kY82mwtoTZ2y-RIU

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
dp9xrfznz

NODE_ENV
production
```

### 5. Deploy
1. Click "Deploy"
2. Wait 3-5 minutes for build to complete
3. Vercel will give you a URL like: `https://techboom-xxx.vercel.app`

### 6. Test Your Deployment
1. Visit your Vercel URL
2. You should see NO DATABASE_URL error
3. Services should load on homepage
4. Login with: `admin@techboom.in` / `Admin@123`

## Automatic Deployments
Every time you push to GitHub, Vercel automatically deploys the changes!

## Custom Domain (Optional)
You can add your own domain in Vercel dashboard → Settings → Domains

## Troubleshooting

### If build fails with "Root directory not found"
- Go to Project Settings → General
- Set Root Directory to: `techboom-app`
- Redeploy

### If you see DATABASE_URL error
- Go to Project Settings → Environment Variables
- Verify DATABASE_URL is there and complete
- Redeploy from Deployments tab

## Advantages Over AWS Amplify
✅ Environment variables work perfectly
✅ Faster builds (3-5 min vs 10-15 min)
✅ Better Next.js support
✅ Automatic preview deployments for PRs
✅ Better logging and debugging
✅ Free SSL certificates
✅ Global CDN included

## Cost
- Free tier: Unlimited personal projects
- Hobby plan: $0/month
- Pro plan: $20/month (only if you need team features)

Your app will work perfectly on the free tier!
