import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, handleApiError } from '@/lib/api-response'
import { getPaginationMeta } from '@/lib/utils'
import { paginationSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const { userId, role } = requireAuth(req)
    const { searchParams } = new URL(req.url)
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    const where = role === 'ADMIN' ? {} : { referrerId: userId }

    const [referrals, total] = await Promise.all([
      prisma.referral.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: { select: { orderNumber: true, amount: true, status: true, service: { select: { name: true } } } },
          referrer: role === 'ADMIN' ? { select: { name: true, email: true } } : false,
        },
      }),
      prisma.referral.count({ where }),
    ])

    // Stats for the user
    const stats = await prisma.referral.aggregate({
      where: { referrerId: userId },
      _sum: { commissionAmount: true },
      _count: true,
    })

    return successResponse({
      referrals,
      meta: getPaginationMeta(total, page, limit),
      stats: {
        totalReferrals: stats._count,
        totalEarnings: stats._sum.commissionAmount || 0,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
