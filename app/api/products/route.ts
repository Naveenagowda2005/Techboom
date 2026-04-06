import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { productSchema, paginationSchema, parsePagination } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { getPaginationMeta } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const { page, limit, search } = parsePagination(searchParams)
    const category = searchParams.get('category')

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(category && { category }),
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    return successResponse({ products, meta: getPaginationMeta(total, page, limit) })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN'])
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) return errorResponse('Validation failed', 400, parsed.error.flatten().fieldErrors)

    const existing = await prisma.product.findUnique({ where: { slug: parsed.data.slug } })
    if (existing) return errorResponse('Slug already exists', 409)

    const product = await prisma.product.create({ data: parsed.data })
    return successResponse(product, 'Product created', 201)
  } catch (error) {
    return handleApiError(error)
  }
}
