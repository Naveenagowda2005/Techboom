# Cloudinary Setup Guide

The product image upload feature uses Cloudinary for storing images. Follow these steps to configure it:

## 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Verify your email

## 2. Get Your Credentials

1. After logging in, go to your Dashboard
2. You'll see your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## 3. Update Your .env File

Replace the placeholder values in your `.env` file:

```env
CLOUDINARY_CLOUD_NAME="your-actual-cloud-name"
CLOUDINARY_API_KEY="your-actual-api-key"
CLOUDINARY_API_SECRET="your-actual-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-actual-cloud-name"
```

## 4. Restart Your Development Server

After updating the .env file, restart your Next.js server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## 5. Test the Upload

1. Go to Admin Panel → Products
2. Click "Add Product"
3. Click "Upload Images from Device"
4. Select one or more images from your computer
5. Images will be uploaded to Cloudinary and displayed in the carousel

## Free Tier Limits

Cloudinary's free tier includes:
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 transformations per month

This is more than enough for development and small production apps.

## Folder Structure

Images are automatically organized in Cloudinary:
- Path: `techboom/products/`
- Each upload gets a unique public ID

## Troubleshooting

If uploads fail:
1. Check that all Cloudinary credentials are correct in `.env`
2. Verify your Cloudinary account is active
3. Check browser console for error messages
4. Ensure you're logged in as ADMIN user
