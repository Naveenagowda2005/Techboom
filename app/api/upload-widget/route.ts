import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'

// Removed edge runtime to use Node.js runtime for JWT compatibility

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN'])
    
    const body = await req.json()
    const { signature, timestamp } = body

    // Generate signature for Cloudinary unsigned upload
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    
    return NextResponse.json({
      success: true,
      data: {
        cloudName,
        uploadPreset: 'techboom_products', // We'll create this
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
