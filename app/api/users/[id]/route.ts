import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, forbiddenResponse, notFoundResponse, handleApiError } from '@/lib/api-response'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, role } = requireAuth(req)
    if (role !== 'ADMIN' && userId !== params.id) return forbiddenResponse()

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        avatar: true, referralCode: true, walletBalance: true,
        isActive: true, isVerified: true, createdAt: true,
        _count: { select: { orders: true, referrals: true, transactions: true } },
      },
    })

    if (!user) return notFoundResponse('User not found')
    return successResponse(user)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, role } = requireAuth(req)
    if (role !== 'ADMIN' && userId !== params.id) return forbiddenResponse()

    const body = await req.json()
    // Only admin can change role/isActive
    const allowedFields = role === 'ADMIN'
      ? ['name', 'phone', 'avatar', 'role', 'isActive', 'isVerified']
      : ['name', 'phone', 'avatar']

    const updateData = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key))
    )

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    })

    return successResponse(user, 'User updated')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { role } = requireAuth(req)
    if (role !== 'ADMIN') return forbiddenResponse()

    // Check if user exists and get their role
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true, name: true }
    })

    if (!user) return notFoundResponse('User not found')

    // Prevent deleting admin users
    if (user.role === 'ADMIN') {
      return forbiddenResponse('Cannot delete admin users')
    }

    // Delete user and all related data
    await prisma.$transaction([
      // Delete user's transactions
      prisma.transaction.deleteMany({ where: { userId: params.id } }),
      // Delete user's referrals (as referrer)
      prisma.referral.deleteMany({ where: { referrerId: params.id } }),
      // Delete user's payments
      prisma.payment.deleteMany({ 
        where: { 
          order: { userId: params.id } 
        } 
      }),
      // Delete user's orders
      prisma.order.deleteMany({ where: { userId: params.id } }),
      // Delete user's campaign participations
      prisma.campaignParticipant.deleteMany({ where: { userId: params.id } }),
      // Delete user's campaigns
      prisma.influencerCampaign.deleteMany({ where: { userId: params.id } }),
      // Finally delete the user
      prisma.user.delete({ where: { id: params.id } })
    ])

    return successResponse(null, 'User deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
