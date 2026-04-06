import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateTokenPair } from '@/lib/jwt'
import { loginSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        referralCode: true,
        walletBalance: true,
        avatar: true,
      },
    })

    if (!user) {
      return errorResponse('Invalid credentials', 401)
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return errorResponse('Invalid credentials', 401)
    }

    // Check if account is deactivated AFTER password validation
    if (!user.isActive) {
      return errorResponse('Your account has been deactivated. Please contact admin at +91 7760322345 or support@techboom.com', 403)
    }

    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role })

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    })

    const { password: _, ...safeUser } = user

    const response = successResponse({ user: safeUser, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }, 'Login successful')
    response.cookies.set('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    })
    response.cookies.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    return handleApiError(error)
  }
}
