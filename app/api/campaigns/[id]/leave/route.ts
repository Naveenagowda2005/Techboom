import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = requireAuth(req)

    const participant = await prisma.campaignParticipant.findUnique({
      where: {
        campaignId_userId: {
          campaignId: params.id,
          userId
        }
      }
    })

    if (!participant) {
      return errorResponse('Not participating in this campaign', 404)
    }

    await prisma.campaignParticipant.update({
      where: {
        campaignId_userId: {
          campaignId: params.id,
          userId
        }
      },
      data: {
        status: 'WITHDRAWN'
      }
    })

    return successResponse(null, 'Successfully left campaign')
  } catch (error) {
    console.error('Campaign leave error:', error)
    return handleApiError(error)
  }
}
