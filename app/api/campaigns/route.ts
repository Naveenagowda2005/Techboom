import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { getPaginationMeta } from '@/lib/utils'
import { parsePagination } from '@/lib/validations'

export async function GET(req: NextRequest) {
  try {
    const { userId, role } = requireAuth(req)
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
      // Use defaults if parsing fails
    }

    const where = role === 'ADMIN' ? {} : { userId }

    const [campaigns, total] = await Promise.all([
      prisma.influencerCampaign.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          _count: {
            select: { participants: true }
          }
        }
      }),
      prisma.influencerCampaign.count({ where })
    ])

    return successResponse({
      campaigns,
      meta: getPaginationMeta(total, page, limit)
    })
  } catch (error) {
    console.error('GET campaigns error:', error)
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)
    const body = await req.json()

    // Validate required fields
    if (!body.title || !body.description || !body.budget || !body.platform || body.platform.length === 0) {
      return errorResponse('Missing required fields', 400)
    }

    const campaign = await prisma.influencerCampaign.create({
      data: {
        userId,
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

    return successResponse(campaign, 'Campaign created', 201)
  } catch (error) {
    console.error('Campaign creation error:', error)
    return handleApiError(error)
  }
}
