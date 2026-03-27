import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse, handleApiError } from '@/lib/api-response'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, role } = requireAuth(req)

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        payment: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    })

    if (!order) return notFoundResponse('Order not found')
    if (role !== 'ADMIN' && order.userId !== userId) return forbiddenResponse()

    return successResponse(order)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { role } = requireAuth(req)
    if (role !== 'ADMIN') return forbiddenResponse()

    const { status } = await req.json()
    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED']
    if (!validStatuses.includes(status)) return errorResponse('Invalid status', 400)

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    })

    // Auto commission on order completion
    if (status === 'COMPLETED' && order.referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: order.referralCode } })
      if (referrer) {
        const commissionAmount = Number(order.amount) * 0.10

        await prisma.$transaction([
          prisma.referral.create({
            data: {
              referrerId: referrer.id,
              orderId: order.id,
              referralCode: order.referralCode,
              commissionAmount,
              isPaid: false,
            },
          }),
          prisma.user.update({
            where: { id: referrer.id },
            data: { walletBalance: { increment: commissionAmount } },
          }),
          prisma.transaction.create({
            data: {
              userId: referrer.id,
              type: 'COMMISSION',
              amount: commissionAmount,
              status: 'COMPLETED',
              description: `Commission for order ${order.orderNumber}`,
              referenceId: order.id,
            },
          }),
        ])
      }
    }

    return successResponse(order, 'Order updated')
  } catch (error) {
    return handleApiError(error)
  }
}
