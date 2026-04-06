import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { productSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError, notFoundResponse } from '@/lib/api-response'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['ADMIN'])
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) return errorResponse('Validation failed', 400, parsed.error.flatten().fieldErrors)

    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) return notFoundResponse('Product not found')

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
    })

    return successResponse(updated, 'Product updated')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['ADMIN'])

    const product = await prisma.product.findUnique({ where: { id: params.id } })
    if (!product) return notFoundResponse('Product not found')

    await prisma.product.delete({ where: { id: params.id } })

    return successResponse(null, 'Product deleted')
  } catch (error) {
    return handleApiError(error)
  }
}
