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

    const { status, notes } = await req.json()
    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED']
    if (!validStatuses.includes(status)) return errorResponse('Invalid status', 400)

    // Get existing order to append notes
    const existingOrder = await prisma.order.findUnique({ where: { id: params.id } })
    if (!existingOrder) return notFoundResponse('Order not found')

    // Append new notes to existing notes with timestamp
    let updatedNotes = existingOrder.notes || ''
    if (notes && notes.trim()) {
      const timestamp = new Date().toLocaleString()
      const newNote = `[${timestamp}] Status changed to ${status}: ${notes}`
      updatedNotes = updatedNotes ? `${updatedNotes}\n\n${newNote}` : newNote
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { 
        status,
        notes: updatedNotes || existingOrder.notes
      },
    })

    // Auto commission on order completion
    if (status === 'COMPLETED' && order.referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: order.referralCode } })
      if (referrer) {
        const commissionAmount = Number(order.amount) * 0.10

        // Check if referral record already exists
        const existingReferral = await prisma.referral.findUnique({
          where: { orderId: order.id }
        })

        if (existingReferral) {
          // Update existing referral with commission
          await prisma.$transaction([
            prisma.referral.update({
              where: { orderId: order.id },
              data: {
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
        } else {
          // Create new referral record (fallback if it doesn't exist)
          await prisma.$transaction([
            prisma.referral.create({
              data: {
                referrerId: referrer.id,
                referredUserId: order.userId,
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
    }

    return successResponse(order, 'Order updated')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, role } = requireAuth(req)

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { payment: true },
    })

    if (!order) return notFoundResponse('Order not found')

    // Only allow deletion of PENDING orders (unpaid)
    if (order.status !== 'PENDING') {
      return errorResponse('Only pending orders can be deleted', 400)
    }

    // Check permissions: customers can delete their own pending orders, admins can delete any
    if (role !== 'ADMIN' && order.userId !== userId) {
      return forbiddenResponse()
    }

    // Delete associated payment record if exists
    if (order.payment) {
      await prisma.payment.delete({ where: { id: order.payment.id } })
    }

    // Delete the order
    await prisma.order.delete({ where: { id: params.id } })

    return successResponse(null, 'Order deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
