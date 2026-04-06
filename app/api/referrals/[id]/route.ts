import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireRole(req, ['ADMIN'])
    const body = await req.json()

    const referral = await prisma.referral.findUnique({
      where: { id: params.id },
    })

    if (!referral) {
      return errorResponse('Referral not found', 404)
    }

    const updated = await prisma.referral.update({
      where: { id: params.id },
      data: body,
    })

    return successResponse(updated, 'Referral updated')
  } catch (error) {
    return handleApiError(error)
  }
}
