import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    requireAuth(req)

    let settings = await prisma.settings.findFirst()

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          referralDiscountPercent: 20,
          referralCommissionPercent: 10
        }
      })
    }

    return successResponse(settings)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)
    requireRole(req, ['ADMIN'])

    const body = await req.json()

    const { referralDiscountPercent, referralCommissionPercent } = body

    // Validate percentages
    if (referralDiscountPercent < 0 || referralDiscountPercent > 100) {
      return errorResponse('Discount percent must be between 0 and 100', 400)
    }

    if (referralCommissionPercent < 0 || referralCommissionPercent > 100) {
      return errorResponse('Commission percent must be between 0 and 100', 400)
    }

    let settings = await prisma.settings.findFirst()

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          referralDiscountPercent,
          referralCommissionPercent,
          updatedBy: userId
        }
      })
    } else {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          referralDiscountPercent,
          referralCommissionPercent,
          updatedBy: userId
        }
      })
    }

    return successResponse(settings, 'Settings updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
