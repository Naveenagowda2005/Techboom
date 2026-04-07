# Setup AWS RDS PostgreSQL Database for Amplify

## Why AWS RDS with Amplify?
- Both services in same AWS account - better integration
- Environment variables might work better
- Database and app in same region - faster
- Can use VPC for security

## Step-by-Step Setup

### Step 1: Create RDS PostgreSQL Database

1. Go to AWS Console: https://console.aws.amazon.com/rds/
2. Click "Create database"
3. Choose these settings:

**Engine options:**
- Engine type: PostgreSQL
- Version: PostgreSQL 15.x (latest)

**Templates:**
- Choose: **Free tier** (if available) OR **Dev/Test**

**Settings:**
- DB instance identifier: `techboom-db`
- Master username: `postgres`
- Master password: Create a strong password (save it!)
- Confirm password

**Instance configuration:**
- DB instance class: `db.t3.micro` (Free tier eligible)
- OR `db.t4g.micro` (cheaper)

**Storage:**
- Storage type: General Purpose SSD (gp3)
- Allocated storage: 20 GB (minimum)
- Enable storage autoscaling: Yes
- Maximum storage threshold: 100 GB

**Connectivity:**
- Compute resource: Don't connect to an EC2 compute resource
- VPC: Default VPC
- Public access: **YES** (Important! So Amplify can connect)
- VPC security group: Create new
- Security group name: `techboom-db-sg`
- Availability Zone: No preference

**Database authentication:**
- Password authentication

**Additional configuration:**
- Initial database name: `techboom` (Important!)
- Enable automated backups: Yes (7 days retention)
- Enable encryption: Yes

4. Click "Create database"
5. Wait 5-10 minutes for database to be created

### Step 2: Configure Security Group

1. After database is created, click on it
2. Go to "Connectivity & security" tab
3. Click on the VPC security group link
4. Click "Edit inbound rules"
5. Add rule:
   - Type: PostgreSQL
   - Protocol: TCP
   - Port: 5432
   - Source: Anywhere-IPv4 (0.0.0.0/0)
   - Description: Allow Amplify access
6. Click "Save rules"

⚠️ **Security Note**: For production, restrict this to Amplify's IP ranges

### Step 3: Get Database Connection String

1. Go back to RDS → Databases → techboom-db
2. Copy the "Endpoint" (looks like: `techboom-db.xxxxx.us-east-1.rds.amazonaws.com`)
3. Create your DATABASE_URL in this format:

```
postgresql://postgres:YOUR_PASSWORD@techboom-db.xxxxx.us-east-1.rds.amazonaws.com:5432/techboom?sslmode=require
```

Replace:
- `YOUR_PASSWORD` with the master password you created
- `techboom-db.xxxxx.us-east-1.rds.amazonaws.com` with your actual endpoint

### Step 4: Update Amplify Environment Variables

1. Go to AWS Amplify Console
2. Your app → Environment variables
3. Update DATABASE_URL with the new RDS connection string
4. Save

### Step 5: Run Database Migrations

You need to create the tables in your new RDS database.

**Option A: From your local machine**

1. Update your local `.env.local` with the new DATABASE_URL
2. Run these commands:

```bash
cd techboom-app
npx prisma migrate deploy
npx prisma db seed
```

**Option B: Add to Amplify build**

Update `amplify.yml` to run migrations during build:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd techboom-app
        - npm ci
    build:
      commands:
        - npx prisma generate
        - npx prisma migrate deploy
        - npx prisma db seed
        - npm run build
  artifacts:
    baseDirectory: techboom-app/.next
    files:
      - '**/*'
  cache:
    paths:
      - techboom-app/node_modules/**/*
      - techboom-app/.next/cache/**/*
```

### Step 6: Redeploy Amplify

1. Go to Amplify Console
2. Click "Redeploy this version"
3. Wait for build to complete
4. Test your app!

## Cost Estimate

**Free Tier (First 12 months):**
- 750 hours/month of db.t3.micro (enough for 1 instance running 24/7)
- 20 GB storage
- 20 GB backup storage
- **Cost: $0/month**

**After Free Tier:**
- db.t3.micro: ~$15/month
- 20 GB storage: ~$2.30/month
- **Total: ~$17-20/month**

**Cost Saving Tips:**
- Use db.t4g.micro (ARM-based): ~$12/month
- Stop database when not in use (Dev/Test only)
- Use Neon free tier instead (stays free forever)

## Advantages of AWS RDS

✅ Integrated with AWS Amplify
✅ Automatic backups
✅ Easy scaling
✅ High availability options
✅ AWS support
✅ Same region = faster

## Disadvantages

❌ Costs money after free tier
❌ More complex setup
❌ Need to manage security groups
❌ Minimum $15-20/month after free tier

## Alternative: Keep Neon Database

Your Neon database is working fine. The issue is just environment variables in Amplify. Consider:

1. **Deploy to Vercel** (free, works perfectly with Neon)
2. **Fix Amplify env vars** (might just need correct format)
3. **Use AWS RDS** (costs money but integrated)

## Recommendation

For a startup/learning project: **Use Vercel + Neon** (both free forever)
For AWS-only requirement: **Use AWS RDS** (costs money but integrated)

## Need Help?

If you choose AWS RDS, I can help you:
1. Create the exact DATABASE_URL format
2. Update the amplify.yml to run migrations
3. Troubleshoot any connection issues
