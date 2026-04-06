import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
    })

    if (!service) {
      return errorResponse('Service not found', 404)
    }

    return successResponse(service)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['ADMIN'])
    const body = await req.json()

    const service = await prisma.service.findUnique({
      where: { id: params.id },
    })

    if (!service) {
      return errorResponse('Service not found', 404)
    }

    const updated = await prisma.service.update({
      where: { id: params.id },
      data: body,
    })

    return successResponse(updated, 'Service updated')
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['ADMIN'])

    const service = await prisma.service.findUnique({
      where: { id: params.id },
    })

    if (!service) {
      return errorResponse('Service not found', 404)
    }

    await prisma.service.delete({
      where: { id: params.id },
    })

    return successResponse(null, 'Service deleted')
  } catch (error) {
    return handleApiError(error)
  }
}
