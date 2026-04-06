import { NextRequest } from 'next/server'
import Razorpay from 'razorpay'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)
    const body = await req.json()
    const { orderId } = body

    console.log('[Create Payment] Request:', { orderId, userId })
    console.log('[Create Payment] Razorpay Key ID:', process.env.RAZORPAY_KEY_ID)
    console.log('[Create Payment] Razorpay Key Secret exists:', !!process.env.RAZORPAY_KEY_SECRET)

    if (!orderId) return errorResponse('Order ID required', 400)

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId },
      include: { service: true, payment: true },
    })

    console.log('[Create Payment] Order found:', order ? 'Yes' : 'No')

    if (!order) return errorResponse('Order not found', 404)
    
    // If payment already exists and is PENDING, delete it to allow retry
    if (order.payment && order.payment.status === 'PENDING') {
      console.log('[Create Payment] Deleting existing PENDING payment to allow retry')
      await prisma.payment.delete({ where: { id: order.payment.id } })
    } else if (order.payment && order.payment.status === 'SUCCESS') {
      return errorResponse('Payment already completed', 400)
    }

    console.log('[Create Payment] Creating Razorpay order for amount:', order.amount)

    // Initialize Razorpay with explicit credentials
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

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

    console.log('[Create Payment] Razorpay order created:', razorpayOrder.id)

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

    console.log('[Create Payment] Payment record stored')

    return successResponse({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('[Create Payment] Error:', error)
    console.error('[Create Payment] Error details:', JSON.stringify(error, null, 2))
    return handleApiError(error)
  }
}
