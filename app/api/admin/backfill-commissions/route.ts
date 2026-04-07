import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, forbiddenResponse, handleApiError } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const { role } = requireAuth(req)
    if (role !== 'ADMIN') return forbiddenResponse()

    // Find all completed orders with referral codes that don't have referral records
    const completedOrders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        referralCode: { not: null },
      },
      include: {
        referral: true,
      },
    })

    let created = 0
    let updated = 0
    let skipped = 0

    for (const order of completedOrders) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: order.referralCode! },
      })

      if (!referrer) {
        skipped++
        continue
      }

      const commissionAmount = Number(order.amount) * 0.10

      if (!order.referral) {
        // Create new referral record with commission
        await prisma.$transaction([
          prisma.referral.create({
            data: {
              referrerId: referrer.id,
              referredUserId: order.userId,
              orderId: order.id,
              referralCode: order.referralCode!,
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
              description: `Commission for order ${order.orderNumber} (backfilled)`,
              referenceId: order.id,
            },
          }),
        ])
        created++
      } else if (order.referral.commissionAmount === 0) {
        // Update existing referral with commission
        await prisma.$transaction([
          prisma.referral.update({
            where: { id: order.referral.id },
            data: { commissionAmount },
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
              description: `Commission for order ${order.orderNumber} (backfilled)`,
              referenceId: order.id,
            },
          }),
        ])
        updated++
      } else {
        skipped++
      }
    }

    return successResponse({
      message: 'Commissions backfilled successfully',
      created,
      updated,
      skipped,
      total: completedOrders.length,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
