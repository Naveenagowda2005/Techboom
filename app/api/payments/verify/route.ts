import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json()

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return errorResponse('Missing payment details', 400)
    }

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      return errorResponse('Payment verification failed', 400)
    }

    // Update payment and order status
    const payment = await prisma.payment.update({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: 'SUCCESS',
      },
      include: { order: true },
    })

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'CONFIRMED' },
    })

    return successResponse({ payment }, 'Payment verified successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
