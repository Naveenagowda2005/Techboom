import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

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
        upiId: true,
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

    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Calculate wallet balance dynamically from unpaid referrals
    const unpaidReferrals = await prisma.referral.findMany({
      where: { 
        referrerId: userId,
        isPaid: false
      },
      select: { commissionAmount: true }
    })

    const walletBalance = unpaidReferrals.reduce((sum, ref) => {
      return sum + (ref.commissionAmount ? Number(ref.commissionAmount) : 0)
    }, 0)

    return successResponse({
      ...user,
      walletBalance
    })
  } catch (error) {
    return handleApiError(error)
  }
}
