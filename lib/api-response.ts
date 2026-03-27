import { NextResponse } from 'next/server'

export function successResponse(data: unknown, message = 'Success', status = 200) {
  return NextResponse.json({ success: true, message, data }, { status })
}

export function errorResponse(message: string, status = 400, errors?: unknown) {
  return NextResponse.json({ success: false, message, errors }, { status })
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return errorResponse(message, 401)
}

export function forbiddenResponse(message = 'Forbidden') {
  return errorResponse(message, 403)
}

export function notFoundResponse(message = 'Not found') {
  return errorResponse(message, 404)
}

export function serverErrorResponse(message = 'Internal server error') {
  return errorResponse(message, 500)
}

// Centralized error handler for API routes
export function handleApiError(error: unknown) {
  console.error('[API Error]', error)
  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') return unauthorizedResponse()
    if (error.message === 'FORBIDDEN') return forbiddenResponse()
    if (error.message === 'NOT_FOUND') return notFoundResponse()
    return errorResponse(error.message)
  }
  return serverErrorResponse()
}
