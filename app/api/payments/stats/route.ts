import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, handleApiError } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN'])

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalPayments,
      successfulPayments,
      pendingPayments,
      failedPayments,
      totalRevenue,
      todayRevenue,
    ] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'SUCCESS' } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'FAILED' } }),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: 'SUCCESS',
          createdAt: { gte: today },
        },
        _sum: { amount: true },
      }),
    ])

    return successResponse({
      totalPayments,
      successfulPayments,
      pendingPayments,
      failedPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
      todayRevenue: todayRevenue._sum.amount || 0,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
