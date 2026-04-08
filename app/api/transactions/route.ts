import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, handleApiError } from '@/lib/api-response'

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)

    // Get all transactions for the user
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 transactions
    })

    return successResponse(transactions)
  } catch (error) {
    console.error('GET transactions error:', error)
    return handleApiError(error)
  }
}
