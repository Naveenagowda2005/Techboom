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
        recentOrders
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
      ])

      return successResponse({
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
        pendingOrders,
        recentOrders,
      })
    }

    // User stats
    const user = await prisma.user.findUnique({ 
      where: { id: userId }, 
      select: { walletBalance: true, role: true } 
    })

    if (user?.role === 'CUSTOMER') {
      // Customer-specific stats
      const [
        totalOrders,
        totalSpent,
        activeOrders,
        completedOrders
      ] = await Promise.all([
        prisma.order.count({ where: { userId } }),
        prisma.payment.aggregate({
          where: { 
            order: { userId },
            status: 'SUCCESS'
          },
          _sum: { amount: true },
        }),
        prisma.order.count({ 
          where: { 
            userId,
            status: { in: ['CONFIRMED', 'IN_PROGRESS'] }
          } 
        }),
        prisma.order.count({ 
          where: { 
            userId,
            status: 'COMPLETED'
          } 
        }),
      ])

      const recentOrders = await prisma.order.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { service: { select: { name: true, category: true } } },
      })

      return successResponse({
        totalOrders,
        totalSpent: totalSpent._sum.amount || 0,
        activeOrders,
        completedOrders,
        recentOrders,
      })
    }

    // Referrer (USER role) stats
    const [
      totalOrders, totalEarnings, pendingCommissions
    ] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.referral.aggregate({
        where: { referrerId: userId },
        _sum: { commissionAmount: true },
      }),
      prisma.referral.count({ where: { referrerId: userId, isPaid: false } }),
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
      walletBalance: user?.walletBalance || 0,
      recentOrders,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
