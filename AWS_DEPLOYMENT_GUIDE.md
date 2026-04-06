# AWS Deployment Guide for Techboom

This guide will walk you through deploying your Techboom Next.js application on AWS.

## Deployment Options

### Option 1: AWS Amplify (Recommended - Easiest)

AWS Amplify is the simplest way to deploy Next.js applications with automatic CI/CD.

#### Steps:

1. **Sign in to AWS Console**
   - Go to https://console.aws.amazon.com/
   - Sign in or create an AWS account

2. **Navigate to AWS Amplify**
   - Search for "Amplify" in the AWS Console
   - Click "Get Started" under "Amplify Hosting"

3. **Connect Your Repository**
   - Select "GitHub" as your Git provider
   - Authorize AWS Amplify to access your GitHub account
   - Select repository: `Naveenagowda2005/Techboom`
   - Select branch: `main`

4. **Configure Build Settings**
   - Amplify will auto-detect Next.js
   - Update the build settings if needed:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
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

5. **Add Environment Variables**
   - Click "Advanced settings"
   - Add all environment variables from your `.env` file:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
     - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
     - `RAZORPAY_KEY_SECRET`
     - `NODE_ENV=production`

6. **Deploy**
   - Click "Save and Deploy"
   - Wait for the build to complete (5-10 minutes)
   - Your app will be available at: `https://main.xxxxx.amplifyapp.com`

7. **Custom Domain (Optional)**
   - Go to "Domain management"
   - Add your custom domain
   - Follow DNS configuration instructions

---

### Option 2: AWS EC2 with PM2 (More Control)

Deploy on a virtual server with full control.

#### Prerequisites:
- AWS Account
- Basic Linux knowledge

#### Steps:

1. **Launch EC2 Instance**
   - Go to EC2 Dashboard
   - Click "Launch Instance"
   - Choose: Ubuntu Server 22.04 LTS
   - Instance type: t2.small or t2.medium (minimum)
   - Configure security group:
     - SSH (22) - Your IP
     - HTTP (80) - Anywhere
     - HTTPS (443) - Anywhere
     - Custom TCP (3000) - Anywhere (for testing)
   - Create or select a key pair
   - Launch instance

2. **Connect to EC2 Instance**
```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

3. **Install Node.js and Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx
```

4. **Setup PostgreSQL Database**
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE techboom;
CREATE USER techboomuser WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE techboom TO techboomuser;
\q
```

5. **Clone and Setup Application**
```bash
# Clone repository
cd /home/ubuntu
git clone https://github.com/Naveenagowda2005/Techboom.git
cd Techboom

# Install dependencies
npm install

# Create .env file
nano .env
```

Add your environment variables:
```env
DATABASE_URL="postgresql://techboomuser:your_secure_password@localhost:5432/techboom"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dp9xrfznz"
CLOUDINARY_API_KEY="772476517938521"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_SZN1g8S6MYedgj"
RAZORPAY_KEY_SECRET="2u73oCIdISaMlIMF9KR9dpzx"
NODE_ENV="production"
```

6. **Setup Database**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

7. **Build Application**
```bash
npm run build
```

8. **Start with PM2**
```bash
# Start application
pm2 start npm --name "techboom" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs
```

9. **Configure Nginx as Reverse Proxy**
```bash
sudo nano /etc/nginx/sites-available/techboom
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or EC2 IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/techboom /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

10. **Setup SSL with Let's Encrypt (Optional but Recommended)**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 3: AWS ECS with Docker (Scalable)

Deploy using containers for better scalability.

#### Steps:

1. **Create Dockerfile**
Create `Dockerfile` in your project root:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

2. **Update next.config.js**
Add this to enable standalone output:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // ... rest of your config
}

module.exports = nextConfig
```

3. **Create .dockerignore**
```
node_modules
.next
.git
.env
.env.local
*.md
```

4. **Build and Push to ECR**
```bash
# Install AWS CLI
# Follow: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

# Configure AWS CLI
aws configure

# Create ECR repository
aws ecr create-repository --repository-name techboom

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build Docker image
docker build -t techboom .

# Tag image
docker tag techboom:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techboom:latest

# Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/techboom:latest
```

5. **Deploy to ECS**
   - Go to ECS Console
   - Create a new cluster
   - Create a task definition using your ECR image
   - Add environment variables
   - Create a service
   - Configure load balancer

---

## Database Options

### Option A: AWS RDS PostgreSQL (Recommended)

1. Go to RDS Console
2. Create database
3. Choose PostgreSQL
4. Select instance size (db.t3.micro for testing)
5. Configure security group to allow connections from your app
6. Get connection string and update `DATABASE_URL`

### Option B: Use Existing PostgreSQL

Keep your current database and ensure it's accessible from AWS.

---

## Post-Deployment Checklist

- [ ] Update `DATABASE_URL` to production database
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Update Razorpay keys to live keys (when ready)
- [ ] Configure custom domain
- [ ] Setup SSL certificate
- [ ] Enable CloudWatch logs
- [ ] Setup backup strategy
- [ ] Configure auto-scaling (if using EC2/ECS)
- [ ] Test all features in production
- [ ] Setup monitoring and alerts

---

## Estimated Costs

### AWS Amplify
- ~$15-30/month for small traffic
- Includes hosting, CI/CD, SSL

### EC2 + RDS
- EC2 t2.small: ~$17/month
- RDS db.t3.micro: ~$15/month
- Total: ~$32/month

### ECS + RDS
- ECS Fargate: ~$20-40/month
- RDS: ~$15/month
- Load Balancer: ~$16/month
- Total: ~$51-71/month

---

## Support

For deployment issues:
- AWS Support: https://console.aws.amazon.com/support/
- Next.js Deployment Docs: https://nextjs.org/docs/deployment

---

## Quick Start (Recommended)

For the fastest deployment, use **AWS Amplify**:
1. Push code to GitHub ✅ (Already done)
2. Connect to Amplify
3. Add environment variables
4. Deploy!

Your app will be live in ~10 minutes!
