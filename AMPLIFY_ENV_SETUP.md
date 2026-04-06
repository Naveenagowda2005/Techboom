# AWS Amplify Environment Variables Setup

## Required Environment Variables

You need to add these environment variables in the AWS Amplify Console:

### How to Add Environment Variables:

1. Go to your Amplify app in AWS Console
2. Click on "Environment variables" in the left sidebar
3. Click "Manage variables"
4. Add each variable below:

---

## Variables to Add:

### Database
```
DATABASE_URL
```
Value: Your PostgreSQL connection string
Example: `postgresql://user:password@host:5432/database`

**Important:** You need a production database. Options:
- AWS RDS PostgreSQL (recommended)
- Your existing database (must be accessible from AWS)

---

### JWT Secret
```
JWT_SECRET
```
Value: A strong random string (at least 32 characters)
Example: `your-super-secret-jwt-key-min-32-chars-change-this`

Generate a secure one:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Cloudinary (Image Upload)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```
Values:
- Cloud Name: `dp9xrfznz`
- API Key: `772476517938521`
- API Secret: Get from your Cloudinary dashboard

---

### Razorpay (Payments)
```
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

**For Testing:**
- Key ID: `rzp_test_SZN1g8S6MYedgj`
- Key Secret: `2u73oCIdISaMlIMF9KR9dpzx`

**For Production (when ready):**
- Get live keys from Razorpay dashboard
- Replace test keys with live keys

---

### Node Environment
```
NODE_ENV
```
Value: `production`

---

## Complete List (Copy-Paste Format)

```
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-this
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dp9xrfznz
CLOUDINARY_API_KEY=772476517938521
CLOUDINARY_API_SECRET=your-cloudinary-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_SZN1g8S6MYedgj
RAZORPAY_KEY_SECRET=2u73oCIdISaMlIMF9KR9dpzx
NODE_ENV=production
```

---

## After Adding Variables:

1. Click "Save"
2. Go to "Deployments" tab
3. Click "Redeploy this version" on the latest build
4. Wait for the new build to complete

---

## Setting Up Production Database (AWS RDS)

If you don't have a production database yet:

### Option 1: AWS RDS PostgreSQL (Recommended)

1. Go to AWS RDS Console
2. Click "Create database"
3. Choose:
   - Engine: PostgreSQL
   - Version: 15.x or latest
   - Template: Free tier (for testing) or Production
   - DB instance: db.t3.micro (free tier) or larger
   - Master username: `techboom`
   - Master password: (create a strong password)
   - Database name: `techboom`
4. Configure:
   - Public access: Yes (for now)
   - VPC security group: Create new
   - Initial database name: `techboom`
5. Click "Create database"
6. Wait 5-10 minutes for creation
7. Get endpoint from RDS dashboard
8. Connection string format:
   ```
   postgresql://techboom:your_password@your-rds-endpoint.region.rds.amazonaws.com:5432/techboom
   ```

### Option 2: Use Existing Database

Make sure your database:
- Is accessible from the internet (or configure VPC peering)
- Allows connections from AWS IP ranges
- Has proper firewall rules

---

## Running Database Migrations

After setting up the database, you need to run migrations:

### Method 1: Using Amplify Build Commands

Update your `amplify.yml` (or build settings in console):

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
        - npx prisma generate
        - npx prisma migrate deploy
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### Method 2: Manual Migration

1. Install PostgreSQL client locally
2. Connect to your RDS database:
   ```bash
   psql "postgresql://techboom:password@your-rds-endpoint:5432/techboom"
   ```
3. Run migrations from your local machine:
   ```bash
   DATABASE_URL="your-production-db-url" npx prisma migrate deploy
   ```

---

## Troubleshooting

### Build Fails with "DATABASE_URL not found"
- Make sure you added all environment variables
- Redeploy after adding variables

### "Cannot connect to database"
- Check RDS security group allows inbound on port 5432
- Verify database is publicly accessible
- Check connection string format

### "Prisma Client not generated"
- Add `npx prisma generate` to preBuild commands
- Redeploy

### "Migration failed"
- Run migrations manually first
- Then redeploy application

---

## Security Notes

⚠️ **Important:**
- Never commit `.env` files to Git
- Use strong passwords for database
- Rotate JWT_SECRET regularly
- Use Razorpay live keys only in production
- Enable RDS encryption
- Restrict database access to specific IPs when possible

---

## Next Steps After Deployment

1. ✅ Add all environment variables
2. ✅ Setup production database
3. ✅ Run database migrations
4. ✅ Redeploy application
5. ✅ Test all features
6. ✅ Configure custom domain (optional)
7. ✅ Enable SSL (automatic with Amplify)
8. ✅ Setup monitoring and alerts

---

## Support

If you encounter issues:
- Check Amplify build logs
- Verify all environment variables are set
- Test database connection
- Check Cloudinary and Razorpay credentials

Your app URL will be: `https://main.xxxxx.amplifyapp.com`
