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

    if (!order.referral) {
      return errorResponse('No referral record found for this order', 404)
    }

    // Update the referral record to mark as paid
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
