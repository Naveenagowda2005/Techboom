import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const { role } = requireAuth(req)
    
    if (role !== 'ADMIN') {
      return errorResponse('Unauthorized', 403)
    }

    const { orderNumber, referrerEmail } = await req.json()

    if (!orderNumber) {
      return errorResponse('Order number is required', 400)
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        referral: true,
        user: true
      }
    })

    if (!order) {
      return errorResponse('Order not found', 404)
    }

    // Get referral code from order or from user who placed the order
    let referralCode = order.referralCode || order.user.referredBy

    if (!referralCode) {
      return errorResponse('This order is not associated with any referral', 400)
    }

    // If no referral record exists, create it first
    if (!order.referral) {
      // Find the referrer
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode }
      })

      if (!referrer) {
        return errorResponse('Referrer not found', 404)
      }

      const commissionAmount = Number(order.amount) * 0.10

      // Create the referral record and transaction
      await prisma.$transaction([
        prisma.referral.create({
          data: {
            referrerId: referrer.id,
            referredUserId: order.userId,
            orderId: order.id,
            referralCode: referralCode,
            commissionAmount,
            isPaid: true,
          }
        }),
        prisma.user.update({
          where: { id: referrer.id },
          data: { walletBalance: { decrement: commissionAmount } }
        }),
        prisma.transaction.create({
          data: {
            userId: referrer.id,
            type: 'COMMISSION',
            amount: commissionAmount,
            status: 'COMPLETED',
            description: `Commission payment for order ${order.orderNumber}`,
            referenceId: order.id,
          }
        })
      ])

      return successResponse({ message: 'Referral record created and marked as paid successfully' })
    }

    // Update existing referral record to mark as paid and create transaction
    const referrer = await prisma.user.findUnique({
      where: { referralCode: referralCode }
    })

    if (!referrer) {
      return errorResponse('Referrer not found', 404)
    }

    await prisma.$transaction([
      prisma.referral.update({
        where: { id: order.referral.id },
        data: { isPaid: true }
      }),
      prisma.user.update({
        where: { id: referrer.id },
        data: { walletBalance: { decrement: Number(order.referral.commissionAmount || 0) } }
      }),
      prisma.transaction.create({
        data: {
          userId: referrer.id,
          type: 'COMMISSION',
          amount: Number(order.referral.commissionAmount || 0),
          status: 'COMPLETED',
          description: `Commission payment for order ${order.orderNumber}`,
          referenceId: order.id,
        }
      })
    ])

    return successResponse({ message: 'Commission marked as paid successfully' })
  } catch (error) {
    console.error('Mark as paid error:', error)
    return handleApiError(error)
  }
}
