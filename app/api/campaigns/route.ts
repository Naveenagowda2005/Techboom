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
    const { page, limit } = parsePagination(searchParams)

    const where = role === 'ADMIN' ? {} : { userId }

    const [campaigns, total] = await Promise.all([
      prisma.influencerCampaign.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } }
        }
      }),
      prisma.influencerCampaign.count({ where })
    ])

    return successResponse({
      campaigns,
      meta: getPaginationMeta(total, page, limit)
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)
    const body = await req.json()

    const campaign = await prisma.influencerCampaign.create({
      data: {
        ...body,
        userId
      }
    })

    return successResponse(campaign, 'Campaign created', 201)
  } catch (error) {
    return handleApiError(error)
  }
}
