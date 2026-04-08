import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'
import { z } from 'zod'

const upiSchema = z.object({
  upiId: z.string().min(3).regex(/^[\w.-]+@[\w]+$/, 'Invalid UPI ID format (e.g., username@bank)')
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)
    const body = await req.json()
    
    const validation = upiSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 400)
    }

    const { upiId } = validation.data

    const user = await prisma.user.update({
      where: { id: userId },
      data: { upiId },
      select: {
        id: true,
        name: true,
        email: true,
        upiId: true,
        walletBalance: true
      }
    })

    return successResponse(user, 'UPI ID updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
