import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { getPaginationMeta } from '@/lib/utils'
import { parsePagination } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const { userId, role } = requireAuth(req)
    const { searchParams } = new URL(req.url)
    
    // Parse pagination with fallback
    let page = 1
    let limit = 10
    try {
      const pagination = parsePagination(searchParams)
      page = pagination.page
      limit = pagination.limit
    } catch (error) {
      console.error('Pagination parse error:', error)
    }

    // Admin view: Get all referred users and their referral records
    if (role === 'ADMIN') {
      // Get all users who were referred (signed up with a referral code)
      const [referredUsers, totalReferred] = await Promise.all([
        prisma.user.findMany({
          where: {
            referredBy: { not: null }
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            referredBy: true,
            createdAt: true,
            orders: {
              where: { status: 'COMPLETED' },
              select: {
                id: true,
                orderNumber: true,
                amount: true,
                status: true,
                createdAt: true,
                referral: {
                  select: {
                    id: true,
                    commissionAmount: true,
                    isPaid: true,
                  }
                }
              }
            }
          }
        }),
        prisma.user.count({
          where: { referredBy: { not: null } }
        })
      ])

      // Get referrer info for each user
      const referralCodes = Array.from(new Set(referredUsers.map(u => u.referredBy).filter(Boolean))) as string[]
      const referrersRaw = await prisma.user.findMany({
        where: { referralCode: { in: referralCodes } }
      })
      
      const referrers = referrersRaw.map(r => ({
        referralCode: r.referralCode,
        name: r.name,
        email: r.email,
        upiId: r.upiId
      }))
      
      const referrerMap = new Map(referrers.map(r => [r.referralCode, r]))

      // Transform to match expected structure
      // @ts-ignore - Complex type inference with flatMap
      const transformedData = (referredUsers.flatMap(user => {
        const referrer = referrerMap.get(user.referredBy!)
        
        if (user.orders.length === 0) {
          // User signed up but no completed orders yet
          return [{
            id: `signup-${user.id}`,
            referralCode: user.referredBy!,
            commissionRate: 0.10,
            commissionAmount: 0,
            isPaid: false,
            createdAt: user.createdAt,
            referrer: referrer || { name: 'Unknown', email: 'N/A', upiId: null },
            referredUser: { name: user.name, email: user.email },
            order: null
          }]
        }
        
        // Create entry for each completed order
        return user.orders.map(order => ({
          id: order.referral?.id || `order-${order.id}`,
          referralCode: user.referredBy!,
          commissionRate: 0.10,
          commissionAmount: Number(order.referral?.commissionAmount || 0) || (Number(order.amount) * 0.10),
          isPaid: order.referral?.isPaid || false,
          createdAt: order.createdAt,
          referrer: referrer || { name: 'Unknown', email: 'N/A', upiId: null },
          referredUser: { name: user.name, email: user.email },
          order: {
            orderNumber: order.orderNumber,
            amount: Number(order.amount),
            status: order.status
          }
        }))
      }) as any[])

      return successResponse({
        referrals: transformedData,
        meta: getPaginationMeta(totalReferred, page, limit),
      })
    }

    // Regular user view: Get their own referrals
    // Get user's referral code
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true }
    })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    // Get all users who signed up with this referral code
    const [referredUsers, totalSignups] = await Promise.all([
      prisma.user.findMany({
        where: { referredBy: user.referralCode },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          orders: {
            select: {
              id: true,
              orderNumber: true,
              amount: true,
              originalAmount: true,
              discountPercent: true,
              discountAmount: true,
              status: true,
              createdAt: true,
              service: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      }),
      prisma.user.count({ where: { referredBy: user.referralCode } })
    ])

    // Get referral records (orders with commissions) - only completed orders
    await prisma.referral.aggregate({
      where: { 
        referrerId: userId,
        order: { status: 'COMPLETED' }
      },
      _sum: { commissionAmount: true },
      _count: true,
    })

    // Calculate total completed orders from referred users
    const completedOrdersCount = await prisma.order.count({
      where: {
        user: { referredBy: user.referralCode },
        status: 'COMPLETED'
      }
    })

    // Calculate total earnings from completed orders (10% commission)
    const completedOrders = await prisma.order.findMany({
      where: {
        user: { referredBy: user.referralCode },
        status: 'COMPLETED'
      },
      select: { amount: true }
    })
    
    const totalEarnings = completedOrders.reduce((sum, order) => {
      return sum + (Number(order.amount) * 0.1)
    }, 0)

    return successResponse({
      referredUsers,
      meta: getPaginationMeta(totalSignups, page, limit),
      stats: {
        totalSignups,
        totalOrders: completedOrdersCount,
        totalEarnings,
        conversionRate: totalSignups > 0 ? ((completedOrdersCount / totalSignups) * 100).toFixed(1) : '0'
      },
    })
  } catch (error) {
    console.error('GET referrals error:', error)
    return handleApiError(error)
  }
}
