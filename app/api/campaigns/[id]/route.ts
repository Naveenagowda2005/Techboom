import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAuth(req)

    const campaign = await prisma.influencerCampaign.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true } }
      }
    })

    if (!campaign) {
      return errorResponse('Campaign not found', 404)
    }

    return successResponse(campaign)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, role } = requireAuth(req)
    const body = await req.json()

    const campaign = await prisma.influencerCampaign.findUnique({
      where: { id: params.id }
    })

    if (!campaign) {
      return errorResponse('Campaign not found', 404)
    }

    // Only allow owner or admin to update
    if (campaign.userId !== userId && role !== 'ADMIN') {
      return errorResponse('Unauthorized', 403)
    }

    // Validate required fields
    if (!body.title || !body.description || !body.budget || !body.platform || body.platform.length === 0) {
      return errorResponse('Missing required fields', 400)
    }

    const updated = await prisma.influencerCampaign.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        budget: body.budget,
        platform: body.platform,
        status: body.status || 'DRAFT',
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    })

    return successResponse(updated, 'Campaign updated')
  } catch (error) {
    console.error('Campaign update error:', error)
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, role } = requireAuth(req)

    const campaign = await prisma.influencerCampaign.findUnique({
      where: { id: params.id }
    })

    if (!campaign) {
      return errorResponse('Campaign not found', 404)
    }

    // Only allow owner or admin to delete
    if (campaign.userId !== userId && role !== 'ADMIN') {
      return errorResponse('Unauthorized', 403)
    }

    await prisma.influencerCampaign.delete({
      where: { id: params.id }
    })

    return successResponse(null, 'Campaign deleted')
  } catch (error) {
    return handleApiError(error)
  }
}
