import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { parsePagination } from '@/lib/validations'
import { getPaginationMeta } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN'])
    
    const { searchParams } = new URL(req.url)
    const { page, limit, search } = parsePagination(searchParams)
    const status = searchParams.get('status')
    
    const where: any = {
      ...(search && {
        OR: [
          { razorpayOrderId: { contains: search, mode: 'insensitive' as const } },
          { razorpayPaymentId: { contains: search, mode: 'insensitive' as const } },
          { order: { orderNumber: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
      ...(status && { status }),
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: {
              user: { select: { name: true, email: true } },
              service: { select: { name: true, category: true } },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ])

    return successResponse({ payments, meta: getPaginationMeta(total, page, limit) })
  } catch (error) {
    return handleApiError(error)
  }
}
