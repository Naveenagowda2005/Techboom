import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, handleApiError } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const { userId, role } = requireAuth(req)

    if (role === 'ADMIN') {
      // Admin stats
      const [
        totalUsers, totalOrders, totalRevenue, pendingOrders,
        recentOrders, monthlyRevenue
      ] = await Promise.all([
        prisma.user.count(),
        prisma.order.count(),
        prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
            service: { select: { name: true } },
          },
        }),
        // Monthly revenue for last 6 months
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('month', created_at) as month,
            SUM(amount) as revenue,
            COUNT(*) as count
          FROM payments
          WHERE status = 'SUCCESS' 
            AND created_at >= NOW() - INTERVAL '6 months'
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY month ASC
        `,
      ])

      return successResponse({
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingOrders,
        recentOrders,
        monthlyRevenue,
      })
    }

    // User stats
    const [
      totalOrders, totalEarnings, pendingCommissions, walletBalance
    ] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.referral.aggregate({
        where: { referrerId: userId },
        _sum: { commissionAmount: true },
      }),
      prisma.referral.count({ where: { referrerId: userId, isPaid: false } }),
      prisma.user.findUnique({ where: { id: userId }, select: { walletBalance: true } }),
    ])

    const recentOrders = await prisma.order.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { service: { select: { name: true, category: true } } },
    })

    return successResponse({
      totalOrders,
      totalEarnings: totalEarnings._sum.commissionAmount || 0,
      pendingCommissions,
      walletBalance: walletBalance?.walletBalance || 0,
      recentOrders,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
