import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, role } = requireAuth(req)

    // Only referrers can join campaigns
    if (role !== 'USER') {
      return errorResponse('Only referrers can join campaigns', 403)
    }

    const campaign = await prisma.influencerCampaign.findUnique({
      where: { id: params.id }
    })

    if (!campaign) {
      return errorResponse('Campaign not found', 404)
    }

    if (campaign.status !== 'ACTIVE') {
      return errorResponse('Campaign is not active', 400)
    }

    // Check if already joined
    const existing = await prisma.campaignParticipant.findUnique({
      where: {
        campaignId_userId: {
          campaignId: params.id,
          userId
        }
      }
    })

    if (existing) {
      return errorResponse('Already joined this campaign', 400)
    }

    const participant = await prisma.campaignParticipant.create({
      data: {
        campaignId: params.id,
        userId,
        status: 'ACTIVE'
      },
      include: {
        campaign: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    })

    return successResponse(participant, 'Successfully joined campaign', 201)
  } catch (error) {
    console.error('Campaign join error:', error)
    return handleApiError(error)
  }
}
