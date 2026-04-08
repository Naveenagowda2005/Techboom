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
    // Get user's referral code
    const referrerUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true }
    })

    if (!referrerUser) {
      return successResponse({
        totalOrders: 0,
        totalEarnings: 0,
        pendingCommissions: 0,
        walletBalance: 0,
        recentOrders: [],
      })
    }

    // Get all referrals for this user
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      select: { 
        commissionAmount: true,
        isPaid: true
      }
    })

    // Calculate wallet balance from unpaid commissions
    const walletBalance = referrals
      .filter(ref => !ref.isPaid && ref.commissionAmount)
      .reduce((sum, ref) => sum + Number(ref.commissionAmount), 0)

    // Calculate total earnings from all paid commissions
    const totalEarnings = referrals
      .filter(ref => ref.isPaid && ref.commissionAmount)
      .reduce((sum, ref) => sum + Number(ref.commissionAmount), 0)

    // Count pending commissions (orders that are not yet completed)
    const pendingCommissions = await prisma.order.count({
      where: {
        user: { referredBy: referrerUser.referralCode },
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] }
      }
    })

    // Get recent orders from referred users
    const recentOrders = await prisma.order.findMany({
      where: {
        user: { referredBy: referrerUser.referralCode }
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        service: { select: { name: true, category: true } },
        user: { select: { name: true, email: true } }
      },
    })

    return successResponse({
      totalOrders: referrals.length,
      totalEarnings,
      pendingCommissions,
      walletBalance,
      recentOrders,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
