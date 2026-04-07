# Complete Solution: AWS Amplify + AWS RDS

## The Problem
AWS Amplify environment variables aren't being injected at runtime for your Next.js app.

## The Solution
Use AWS RDS PostgreSQL database which integrates better with AWS Amplify.

## Quick Setup (30 minutes)

### Part 1: Create AWS RDS Database (10 min)

1. **Go to AWS RDS Console**: https://console.aws.amazon.com/rds/
2. **Click "Create database"**
3. **Use these EXACT settings**:

```
Engine: PostgreSQL 15.x
Template: Free tier (or Dev/Test)

Settings:
- DB identifier: techboom-db
- Master username: postgres
- Master password: [Create strong password - SAVE IT!]

Instance: db.t3.micro (free tier)
Storage: 20 GB

Connectivity:
- Public access: YES ✅ (Important!)
- Create new security group

Additional:
- Initial database name: techboom ✅ (Important!)
```

4. **Click "Create database"**
5. **Wait 5-10 minutes**

### Part 2: Allow Public Access (5 min)

1. After database is created, click on `techboom-db`
2. Go to **"Connectivity & security"** tab
3. Click the **VPC security group** link
4. Click **"Edit inbound rules"**
5. Click **"Add rule"**:
   ```
   Type: PostgreSQL
   Port: 5432
   Source: 0.0.0.0/0 (Anywhere)
   ```
6. **Click "Save rules"**

### Part 3: Get Connection String (2 min)

1. Go back to RDS → Databases → techboom-db
2. Copy the **"Endpoint"** (looks like: `techboom-db.xxxxx.us-east-1.rds.amazonaws.com`)
3. Create your DATABASE_URL:

```
postgresql://postgres:YOUR_PASSWORD@YOUR_ENDPOINT:5432/techboom?sslmode=require
```

**Example:**
```
postgresql://postgres:MyPass123!@techboom-db.abc123.us-east-1.rds.amazonaws.com:5432/techboom?sslmode=require
```

### Part 4: Setup Database Tables (5 min)

**From your local computer:**

1. Open `techboom-app/.env.local`
2. Replace DATABASE_URL with your new RDS connection string
3. Run these commands:

```bash
cd techboom-app
npx prisma migrate deploy
npx prisma db seed
```

This creates all tables and adds demo data.

### Part 5: Update Amplify (5 min)

1. **Go to AWS Amplify Console**
2. **Your app → Environment variables**
3. **Find DATABASE_URL and click "Edit"**
4. **Replace with your new RDS connection string**
5. **Click "Save"**
6. **Click "Redeploy this version"**
7. **Wait 5-10 minutes for build**

### Part 6: Test (2 min)

1. Visit your Amplify URL
2. You should see NO DATABASE_URL error! ✅
3. Login with: `admin@techboom.in` / `Admin@123`

## Why This Works

AWS RDS and AWS Amplify are in the same AWS account, so:
- Better network connectivity
- Environment variables work more reliably
- Same region = faster database queries
- Integrated AWS monitoring

## Cost

**First 12 months (Free Tier):**
- ✅ FREE (750 hours/month of db.t3.micro)

**After 12 months:**
- 💰 ~$15-20/month

**To keep it free forever:**
- Use Neon database (free forever)
- Deploy to Vercel (free forever)

## Troubleshooting

### "Could not connect to database"
- Check security group allows 0.0.0.0/0 on port 5432
- Verify "Public access" is set to YES
- Check DATABASE_URL format is correct

### "Database does not exist"
- Make sure you set "Initial database name" to `techboom` when creating RDS
- Or connect and create it manually

### "Authentication failed"
- Double-check your master password
- Make sure no special characters are URL-encoded in DATABASE_URL

### Still seeing DATABASE_URL error
- Verify the environment variable is saved in Amplify Console
- Make sure it's on the "main" branch
- Try deleting and re-adding the variable
- Redeploy after saving

## Alternative: Just Use Vercel

If you don't want to pay for RDS after 12 months:

1. Deploy to Vercel (free forever)
2. Keep using Neon database (free forever)
3. Total cost: $0/month forever
4. Better Next.js support
5. Faster deployments

See `VERCEL_DEPLOYMENT.md` for instructions.

## Need Help?

Common issues:
1. **Forgot to set "Initial database name"**: You'll need to create the database manually
2. **Forgot to enable "Public access"**: Edit the database settings to enable it
3. **Security group not configured**: Add the inbound rule for port 5432
4. **Wrong DATABASE_URL format**: Make sure it matches the example above

Let me know which step you're stuck on!
