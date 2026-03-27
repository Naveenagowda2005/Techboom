import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyRefreshToken, generateTokenPair } from '@/lib/jwt'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value
    if (!refreshToken) return errorResponse('No refresh token', 401)

    const payload = verifyRefreshToken(refreshToken)

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, refreshToken: true, isActive: true },
    })

    if (!user || !user.isActive || user.refreshToken !== refreshToken) {
      return errorResponse('Invalid refresh token', 401)
    }

    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role })

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    })

    const response = successResponse(tokens, 'Token refreshed')
    response.cookies.set('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
    })
    response.cookies.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    return handleApiError(error)
  }
}
