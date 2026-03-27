import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { paginationSchema } from '@/lib/validations'
import { successResponse, handleApiError } from '@/lib/api-response'
import { getPaginationMeta } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN'])
    const { searchParams } = new URL(req.url)
    const { page, limit, search } = paginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
    })

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          isActive: true,
          referralCode: true,
          walletBalance: true,
          createdAt: true,
          _count: { select: { orders: true, referrals: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    return successResponse({ users, meta: getPaginationMeta(total, page, limit) })
  } catch (error) {
    return handleApiError(error)
  }
}
