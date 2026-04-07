import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { orderSchema, paginationSchema, parsePagination } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { generateOrderNumber, getPaginationMeta } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { userId, role } = requireAuth(req)
    const { searchParams } = new URL(req.url)
    const { page, limit } = parsePagination(searchParams)

    // Admin sees all orders, users see their own
    const where = role === 'ADMIN' ? {} : { userId }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          service: { select: { name: true, category: true, icon: true } },
          payment: { select: { status: true, amount: true } },
          user: role === 'ADMIN' ? { select: { name: true, email: true } } : false,
        },
      }),
      prisma.order.count({ where }),
    ])

    return successResponse({ orders, meta: getPaginationMeta(total, page, limit) })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)
    const body = await req.json()
    const parsed = orderSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.flatten().fieldErrors)
    }

    const { serviceId, notes, requirements, referralCode } = parsed.data

    const service = await prisma.service.findUnique({ where: { id: serviceId, isActive: true } })
    if (!service) return errorResponse('Service not found', 404)

    // Validate referral code
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } })
      if (!referrer) return errorResponse('Invalid referral code', 400)
      // Prevent self-referral
      if (referrer.id === userId) return errorResponse('Cannot use your own referral code', 400)
    }

    // Check for first order discount
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        firstOrderDiscount: true, 
        hasUsedFirstOrderDiscount: true,
        referredBy: true 
      }
    })

    let discountPercent = 0
    let discountAmount = 0
    let finalAmount = Number(service.price)
    const originalAmount = Number(service.price)

    // Apply first order discount if eligible
    if (user && user.firstOrderDiscount > 0 && !user.hasUsedFirstOrderDiscount) {
      discountPercent = user.firstOrderDiscount
      discountAmount = (originalAmount * discountPercent) / 100
      finalAmount = originalAmount - discountAmount
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        serviceId,
        amount: finalAmount,
        originalAmount: discountPercent > 0 ? originalAmount : null,
        discountPercent,
        discountAmount,
        notes,
        requirements: requirements as Record<string, string> | undefined,
        referralCode,
      },
      include: {
        service: { select: { name: true, category: true } },
      },
    })

    // Mark discount as used if it was applied
    if (discountPercent > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { hasUsedFirstOrderDiscount: true }
      })
    }

    // Create referral record if order was placed with referral code
    if (referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode } })
      if (referrer) {
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            referredUserId: userId,
            orderId: order.id,
            referralCode,
            commissionAmount: 0, // Will be updated when order is completed
            isPaid: false,
          },
        })
      }
    }

    return successResponse(order, 'Order created', 201)
  } catch (error) {
    return handleApiError(error)
  }
}
