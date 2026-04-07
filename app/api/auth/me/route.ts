import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, handleApiError } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        referralCode: true,
        walletBalance: true,
        isVerified: true,
        firstOrderDiscount: true,
        hasUsedFirstOrderDiscount: true,
        createdAt: true,
        _count: {
          select: {
            referrals: true,
            orders: true,
          },
        },
      },
    })

    return successResponse(user)
  } catch (error) {
    return handleApiError(error)
  }
}
