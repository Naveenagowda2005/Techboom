import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateTokenPair } from '@/lib/jwt'
import { registerSchema } from '@/lib/validations'
import { generateReferralCode } from '@/lib/utils'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { name, email, password, phone, referralCode: refCode } = parsed.data
    
    // Get role from request body, default to CUSTOMER for public signups
    const requestedRole = body.role || 'CUSTOMER'
    
    // Only allow USER and CUSTOMER roles from public registration
    const role = (requestedRole === 'USER' || requestedRole === 'CUSTOMER') ? requestedRole : 'CUSTOMER'

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return errorResponse('Email already registered', 409)
    }

    // Validate referral code if provided
    if (refCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: refCode } })
      if (!referrer) {
        return errorResponse('Invalid referral code', 400)
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const newReferralCode = generateReferralCode()

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role, // Use the determined role
        referralCode: newReferralCode,
        referredBy: refCode || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        referralCode: true,
        createdAt: true,
      },
    })

    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role })

    // Store refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    })

    const response = successResponse({ user, ...tokens }, 'Registration successful', 201)
    response.cookies.set('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
    })
    response.cookies.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    return handleApiError(error)
  }
}
