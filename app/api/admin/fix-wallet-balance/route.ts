import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, forbiddenResponse, handleApiError } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  try {
    const { role } = requireAuth(req)
    if (role !== 'ADMIN') return forbiddenResponse()

    // Get all completed orders with referral codes
    const completedOrders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        referralCode: { not: null }
      },
      include: {
        referral: true
      }
    })

    // Group by referrer (referral code)
    const referrerMap = new Map<string, { totalCommission: number, paidCommission: number }>()

    for (const order of completedOrders) {
      const referralCode = order.referralCode!
      
      if (!referrerMap.has(referralCode)) {
        referrerMap.set(referralCode, { totalCommission: 0, paidCommission: 0 })
      }
      
      const data = referrerMap.get(referralCode)!
      const commission = Number(order.amount) * 0.10
      
      data.totalCommission += commission
      
      // Check if this order's commission is marked as paid
      if (order.referral && order.referral.isPaid) {
        data.paidCommission += commission
      }
    }

    let updated = 0

    // Update wallet balance for each referrer
    for (const [referralCode, data] of referrerMap.entries()) {
      const correctBalance = data.totalCommission - data.paidCommission

      const referrer = await prisma.user.findUnique({
        where: { referralCode }
      })

      if (referrer) {
        await prisma.user.update({
          where: { id: referrer.id },
          data: { walletBalance: correctBalance }
        })
        updated++
      }
    }

    return successResponse({
      message: 'Wallet balances fixed successfully',
      updated,
      details: Array.from(referrerMap.entries()).map(([code, data]) => ({
        referralCode: code,
        totalCommission: data.totalCommission,
        paidCommission: data.paidCommission,
        balance: data.totalCommission - data.paidCommission
      }))
    })
  } catch (error) {
    return handleApiError(error)
  }
}
