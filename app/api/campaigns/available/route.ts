import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, handleApiError } from '@/lib/api-response'
import { getPaginationMeta } from '@/lib/utils'
import { parsePagination } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)
    const { searchParams } = new URL(req.url)
    
    // Parse pagination with fallback
    let page = 1
    let limit = 10
    try {
      const pagination = parsePagination(searchParams)
      page = pagination.page
      limit = pagination.limit
    } catch (error) {
      console.error('Pagination parse error:', error)
    }
    
    const platform = searchParams.get('platform')

    const where: any = {
      status: 'ACTIVE'
    }

    if (platform) {
      where.platform = {
        has: platform
      }
    }

    const [campaigns, total] = await Promise.all([
      prisma.influencerCampaign.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          participants: {
            where: { userId },
            select: { id: true, status: true, joinedAt: true }
          },
          _count: {
            select: { participants: true }
          }
        }
      }),
      prisma.influencerCampaign.count({ where })
    ])

    // Add isJoined flag
    const campaignsWithStatus = campaigns.map(campaign => ({
      ...campaign,
      isJoined: campaign.participants.length > 0,
      participantStatus: campaign.participants[0]?.status || null,
      totalParticipants: campaign._count.participants
    }))

    return successResponse({
      campaigns: campaignsWithStatus,
      meta: getPaginationMeta(total, page, limit)
    })
  } catch (error) {
    console.error('GET available campaigns error:', error)
    return handleApiError(error)
  }
}
