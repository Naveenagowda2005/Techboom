# Techboom — SaaS Platform

A production-ready, full-stack SaaS platform built with Next.js 14, TypeScript, PostgreSQL, and Prisma.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Server Actions
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (access + refresh tokens) + bcrypt
- **Payments**: Razorpay
- **Storage**: Cloudinary
- **Deployment**: Vercel

## Quick Start

### 1. Clone & Install

```bash
git clone <repo>
cd techboom-app
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
# Fill in all required values
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

After seeding:
- **Admin**: admin@techboom.in / Admin@123
- **User**: demo@techboom.in / User@123

## Project Structure

```
techboom-app/
├── app/
│   ├── (auth)/          # Login, Signup pages
│   ├── (dashboard)/     # Dashboard + Admin panel
│   ├── (public)/        # Service pages
│   └── api/             # REST API routes
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Navbar, Footer
│   ├── home/            # Homepage sections
│   └── dashboard/       # Dashboard components
├── lib/                 # Prisma, JWT, auth, utils
├── services/            # Business logic layer
├── hooks/               # Custom React hooks
├── types/               # TypeScript types
├── prisma/              # Schema + seed
└── middleware.ts        # Auth + security middleware
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| POST | /api/auth/refresh | Refresh tokens |
| GET | /api/auth/me | Get current user |
| GET | /api/services | List services |
| POST | /api/services | Create service (admin) |
| GET | /api/orders | List orders |
| POST | /api/orders | Create order |
| PATCH | /api/orders/:id | Update order status (admin) |
| POST | /api/payments/create-order | Create Razorpay order |
| POST | /api/payments/verify | Verify payment |
| POST | /api/payments/webhook | Razorpay webhook |
| GET | /api/referrals | Get referrals |
| GET | /api/users | List users (admin) |
| GET | /api/products | List products |
| GET | /api/dashboard/stats | Dashboard stats |

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

## Security Features

- JWT access + refresh token rotation
- bcrypt password hashing (12 rounds)
- Role-based access control (ADMIN/USER/CUSTOMER)
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS protection headers
- CSRF protection
- Rate limiting ready
- Secure httpOnly cookies
