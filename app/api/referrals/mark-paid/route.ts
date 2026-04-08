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

    if (!order.referralCode) {
      return errorResponse('This order was not placed with a referral code', 400)
    }

    // If no referral record exists, create it first
    if (!order.referral) {
      // Find the referrer
      const referrer = await prisma.user.findUnique({
        where: { referralCode: order.referralCode }
      })

      if (!referrer) {
        return errorResponse('Referrer not found', 404)
      }

      const commissionAmount = Number(order.amount) * 0.10

      // Create the referral record
      await prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredUserId: order.userId,
          orderId: order.id,
          referralCode: order.referralCode,
          commissionAmount,
          isPaid: true, // Mark as paid immediately
        }
      })

      return successResponse({ message: 'Referral record created and marked as paid successfully' })
    }

    // Update existing referral record to mark as paid
    await prisma.referral.update({
      where: { id: order.referral.id },
      data: { isPaid: true }
    })

    return successResponse({ message: 'Commission marked as paid successfully' })
  } catch (error) {
    console.error('Mark as paid error:', error)
    return handleApiError(error)
  }
}
