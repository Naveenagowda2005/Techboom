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

    // Handle commission based on order status
    if (status === 'COMPLETED') {
      // Order completed - add commission
      const orderUser = await prisma.user.findUnique({
        where: { id: order.userId },
        select: { referredBy: true }
      })

      const referralCode = order.referralCode || orderUser?.referredBy

      if (referralCode) {
        const referrer = await prisma.user.findUnique({ where: { referralCode } })
        if (referrer) {
          const commissionAmount = Number(order.amount) * 0.10

          const existingReferral = await prisma.referral.findUnique({
            where: { orderId: order.id }
          })

          if (existingReferral) {
            // Update existing referral with commission
            await prisma.referral.update({
              where: { orderId: order.id },
              data: {
                commissionAmount,
                isPaid: false,
              },
            })
          } else {
            // Create new referral record
            await prisma.referral.create({
              data: {
                referrerId: referrer.id,
                referredUserId: order.userId,
                orderId: order.id,
                referralCode: referralCode,
                commissionAmount,
                isPaid: false,
              },
            })
          }
        }
      }
    } else if (['CONFIRMED', 'IN_PROGRESS', 'PENDING', 'CANCELLED', 'REFUNDED'].includes(status)) {
      // Order status changed from COMPLETED to something else - remove commission
      const existingReferral = await prisma.referral.findUnique({
        where: { orderId: order.id }
      })

      if (existingReferral && !existingReferral.isPaid) {
        // Only remove commission if it hasn't been paid yet
        await prisma.referral.update({
          where: { orderId: order.id },
          data: {
            commissionAmount: 0,
          },
        })
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
