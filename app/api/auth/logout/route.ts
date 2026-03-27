import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'
import { successResponse } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  const user = authenticateRequest(req)
  if (user) {
    await prisma.user.update({
      where: { id: user.userId },
      data: { refreshToken: null },
    }).catch(() => {}) // Ignore errors on logout
  }

  const response = successResponse(null, 'Logged out successfully')
  response.cookies.delete('access_token')
  response.cookies.delete('refresh_token')
  return response
}
