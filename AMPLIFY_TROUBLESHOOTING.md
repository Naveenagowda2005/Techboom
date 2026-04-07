# AWS Amplify Deployment Troubleshooting

## Current Issue: DATABASE_URL Not Found at Runtime

The error "Environment variable not found: DATABASE_URL" appears because environment variables aren't properly configured in AWS Amplify.

## Solution Steps

### 1. Verify Environment Variables in AWS Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app (Techboom)
3. Click on "Environment variables" in the left sidebar
4. Verify ALL these variables are present:

```
DATABASE_URL=postgresql://neondb_owner:npg_Vq72TSCxcZmj@ep-aged-cloud-ancpsk8y-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_ACCESS_SECRET=a8f5e2c9b1d4f7e3a6c8b2d5f9e1c4a7b3d6f8e2c5a9b1d4f7e3a6c8b2d5f9e1

JWT_REFRESH_SECRET=c4a7b3d6f8e2c5a9b1d4f7e3a6c8b2d5f9e1c4a7b3d6f8e2c5a9b1d4f7e3a6c8

JWT_ACCESS_EXPIRES=15m

JWT_REFRESH_EXPIRES=7d

RAZORPAY_KEY_ID=rzp_test_SZN1g8S6MYedgj

RAZORPAY_KEY_SECRET=2u73oCIdISaMlIMF9KR9dpzx

NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_SZN1g8S6MYedgj

CLOUDINARY_CLOUD_NAME=dp9xrfznz

CLOUDINARY_API_KEY=772476517938521

CLOUDINARY_API_SECRET=YOUR_ACTUAL_SECRET_HERE

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dp9xrfznz

NODE_ENV=production
```

### 2. Important Notes

- **DATABASE_URL must be the FULL connection string** - Don't let it get truncated
- **All variables must be on the "main" branch** - Check the "Branch" column
- **After adding/updating variables, you MUST redeploy**

### 3. Force Redeploy

After verifying all environment variables:

1. In AWS Amplify Console, go to your app
2. Click on the latest build
3. Click "Redeploy this version" button
4. Wait for the build to complete

### 4. Verify Deployment

Once deployed, the app should work. If you still see the error:

1. Check browser console for any other errors
2. Verify the DATABASE_URL in Amplify console is complete (not truncated)
3. Make sure you're accessing the correct Amplify URL (not localhost)

## Common Issues

### Issue: DATABASE_URL appears truncated in Amplify console
**Solution**: Delete the variable and re-add it, making sure to paste the complete connection string

### Issue: Changes don't appear after redeploy
**Solution**: Clear your browser cache or try in incognito mode

### Issue: Some pages work but login doesn't
**Solution**: This means the app is deployed but DATABASE_URL isn't available. Double-check step 1 above.

## Testing the Deployment

1. Visit your Amplify URL (e.g., `https://main.xxxxx.amplifyapp.com`)
2. Try to access the login page
3. If you see the Prisma error, environment variables aren't configured
4. If the login form loads without errors, try logging in with test credentials

## Need Help?

If the issue persists after following all steps:
1. Take a screenshot of your Environment Variables page in Amplify
2. Take a screenshot of the error in the browser
3. Check the Amplify build logs for any errors during deployment
