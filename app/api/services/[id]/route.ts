import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { serviceSchema } from '@/lib/validations'
import { successResponse, errorResponse, notFoundResponse, handleApiError } from '@/lib/api-response'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const service = await prisma.service.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }], isActive: true },
    })
    if (!service) return notFoundResponse('Service not found')
    return successResponse(service)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['ADMIN'])
    const body = await req.json()
    const parsed = serviceSchema.partial().safeParse(body)
    if (!parsed.success) return errorResponse('Validation failed', 400, parsed.error.flatten().fieldErrors)

    const service = await prisma.service.update({
      where: { id: params.id },
      data: parsed.data,
    })
    return successResponse(service, 'Service updated')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['ADMIN'])
    await prisma.service.update({ where: { id: params.id }, data: { isActive: false } })
    return successResponse(null, 'Service deleted')
  } catch (error) {
    return handleApiError(error)
  }
}
