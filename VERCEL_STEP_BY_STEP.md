# Deploy Techboom to Vercel - Step by Step

## ✅ Step 1: Create Vercel Account (2 minutes)

1. Open your browser and go to: **https://vercel.com**
2. Click **"Sign Up"** button (top right)
3. Click **"Continue with GitHub"**
4. Log in with your GitHub account (the one with Techboom repo)
5. Click **"Authorize Vercel"** when prompted
6. You'll be redirected to Vercel dashboard

## ✅ Step 2: Import Your Project (1 minute)

1. On Vercel dashboard, click **"Add New..."** button
2. Select **"Project"** from dropdown
3. You'll see a list of your GitHub repositories
4. Find **"Techboom"** in the list
5. Click **"Import"** button next to it

## ✅ Step 3: Configure Project Settings (3 minutes)

You'll see a configuration screen. Set these values:

### Project Name
- Leave as: `Techboom` (or change if you want)

### Framework Preset
- Should auto-detect as: **Next.js** ✅

### Root Directory
- Click **"Edit"** next to Root Directory
- Type: `techboom-app`
- Click **"Continue"**

⚠️ **IMPORTANT**: Root directory MUST be `techboom-app`

### Build and Output Settings
- Leave all as default (don't change anything)

## ✅ Step 4: Add Environment Variables (5 minutes)

Scroll down to **"Environment Variables"** section and click to expand it.

Add these variables ONE BY ONE (click "Add" after each):

### Variable 1: DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_Vq72TSCxcZmj@ep-aged-cloud-ancpsk8y-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Variable 2: JWT_ACCESS_SECRET
```
Name: JWT_ACCESS_SECRET
Value: a8f5e2c9b1d4f7e3a6c8b2d5f9e1c4a7b3d6f8e2c5a9b1d4f7e3a6c8b2d5f9e1
```

### Variable 3: JWT_REFRESH_SECRET
```
Name: JWT_REFRESH_SECRET
Value: c4a7b3d6f8e2c5a9b1d4f7e3a6c8b2d5f9e1c4a7b3d6f8e2c5a9b1d4f7e3a6c8
```

### Variable 4: JWT_ACCESS_EXPIRES
```
Name: JWT_ACCESS_EXPIRES
Value: 15m
```

### Variable 5: JWT_REFRESH_EXPIRES
```
Name: JWT_REFRESH_EXPIRES
Value: 7d
```

### Variable 6: RAZORPAY_KEY_ID
```
Name: RAZORPAY_KEY_ID
Value: rzp_test_SZN1g8S6MYedgj
```

### Variable 7: RAZORPAY_KEY_SECRET
```
Name: RAZORPAY_KEY_SECRET
Value: 2u73oCIdISaMlIMF9KR9dpzx
```

### Variable 8: NEXT_PUBLIC_RAZORPAY_KEY_ID
```
Name: NEXT_PUBLIC_RAZORPAY_KEY_ID
Value: rzp_test_SZN1g8S6MYedgj
```

### Variable 9: CLOUDINARY_CLOUD_NAME
```
Name: CLOUDINARY_CLOUD_NAME
Value: dp9xrfznz
```

### Variable 10: CLOUDINARY_API_KEY
```
Name: CLOUDINARY_API_KEY
Value: 772476517938521
```

### Variable 11: CLOUDINARY_API_SECRET
```
Name: CLOUDINARY_API_SECRET
Value: DA6Z8huFta4kY82mwtoTZ2y-RIU
```

### Variable 12: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
```
Name: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
Value: dp9xrfznz
```

### Variable 13: NODE_ENV
```
Name: NODE_ENV
Value: production
```

## ✅ Step 5: Deploy! (1 click)

1. After adding all 13 environment variables
2. Click the big **"Deploy"** button at the bottom
3. Wait 3-5 minutes for build to complete
4. You'll see a success screen with confetti! 🎉

## ✅ Step 6: Get Your URL

After deployment completes:

1. You'll see your deployment URL (like: `https://techboom-xxx.vercel.app`)
2. Click **"Visit"** button to open your app
3. Or copy the URL to share

## ✅ Step 7: Test Your App (2 minutes)

1. Visit your Vercel URL
2. You should see the homepage with NO errors! ✅
3. Services should load on the homepage
4. Click **"Login"** 
5. Try logging in with:
   - Email: `admin@techboom.in`
   - Password: `Admin@123`
6. You should be redirected to admin dashboard! ✅

## 🎉 Success!

Your app is now live on Vercel with:
- ✅ Frontend working
- ✅ Backend APIs working
- ✅ Database connected
- ✅ Authentication working
- ✅ Payments ready
- ✅ Everything functional!

## What Happens Next?

### Automatic Deployments
Every time you push code to GitHub, Vercel automatically deploys the changes!

```
You push to GitHub → Vercel detects change → Builds automatically → Deploys new version
```

### Your URLs
- **Production**: `https://techboom-xxx.vercel.app` (from main branch)
- **Preview**: Vercel creates preview URLs for other branches

## Troubleshooting

### Build Failed: "Root directory not found"
**Solution:**
1. Go to Project Settings → General
2. Set Root Directory to: `techboom-app`
3. Click "Save"
4. Go to Deployments tab
5. Click "Redeploy" on the latest deployment

### Build Failed: "Prisma generate error"
**Solution:** This shouldn't happen, but if it does:
1. Go to Project Settings → Environment Variables
2. Verify DATABASE_URL is there and complete
3. Redeploy

### App loads but shows DATABASE_URL error
**Solution:**
1. Go to Project Settings → Environment Variables
2. Check if DATABASE_URL exists
3. If not, add it and redeploy
4. If yes, verify it's the complete connection string

### Services not showing
**Solution:**
1. Make sure your Neon database is seeded
2. Check browser console (F12) for errors
3. Verify DATABASE_URL is correct

## Need Help?

If you get stuck at any step, let me know which step number and what error you're seeing!

## Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Go to Project Settings → Domains
   - Add your own domain (like techboom.com)

2. **Team Collaboration** (Optional)
   - Invite team members from Project Settings

3. **Analytics** (Free)
   - Vercel provides free analytics
   - See visitor stats, performance metrics

4. **Monitor Logs**
   - Go to Deployments → Click deployment → View Function Logs
   - See real-time API logs

Enjoy your deployed app! 🚀
