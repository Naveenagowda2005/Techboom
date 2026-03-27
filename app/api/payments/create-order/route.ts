import { NextRequest } from 'next/server'
import Razorpay from 'razorpay'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)
    const { orderId } = await req.json()

    if (!orderId) return errorResponse('Order ID required', 400)

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId },
      include: { service: true, payment: true },
    })

    if (!order) return errorResponse('Order not found', 404)
    if (order.payment) return errorResponse('Payment already initiated', 400)

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(order.amount) * 100), // paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        userId,
        serviceName: order.service.name,
      },
    })

    // Store payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: order.amount,
        currency: 'INR',
        status: 'PENDING',
      },
    })

    return successResponse({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
