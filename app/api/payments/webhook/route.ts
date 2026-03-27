import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) return errorResponse('Missing signature', 400)

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      return errorResponse('Invalid webhook signature', 400)
    }

    const event = JSON.parse(body)

    if (event.event === 'payment.captured') {
      const { order_id, id: paymentId } = event.payload.payment.entity

      await prisma.payment.updateMany({
        where: { razorpayOrderId: order_id },
        data: { razorpayPaymentId: paymentId, status: 'SUCCESS' },
      })
    }

    if (event.event === 'payment.failed') {
      const { order_id } = event.payload.payment.entity
      await prisma.payment.updateMany({
        where: { razorpayOrderId: order_id },
        data: { status: 'FAILED' },
      })
    }

    return successResponse(null, 'Webhook processed')
  } catch (error) {
    console.error('[Webhook Error]', error)
    return errorResponse('Webhook processing failed', 500)
  }
}
