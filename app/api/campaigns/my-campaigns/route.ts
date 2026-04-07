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

    const [participations, total] = await Promise.all([
      prisma.campaignParticipant.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { joinedAt: 'desc' },
        include: {
          campaign: {
            include: {
              user: { select: { name: true, email: true } }
            }
          }
        }
      }),
      prisma.campaignParticipant.count({ where: { userId } })
    ])

    return successResponse({
      participations,
      meta: getPaginationMeta(total, page, limit)
    })
  } catch (error) {
    console.error('GET my campaigns error:', error)
    return handleApiError(error)
  }
}
