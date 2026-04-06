import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    requireRole(req, ['ADMIN'])

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME

    console.log('Uploading to Cloudinary using unsigned preset...')

    // Use unsigned upload preset
    const uploadFormData = new FormData()
    uploadFormData.append('file', dataURI)
    uploadFormData.append('upload_preset', 'techboom_unsigned')
    uploadFormData.append('folder', 'techboom/products')

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    )

    const result = await uploadResponse.json()
    
    if (!uploadResponse.ok) {
      console.error('Cloudinary error:', result)
      return NextResponse.json(
        { success: false, error: result.error?.message || 'Upload failed' },
        { status: uploadResponse.status }
      )
    }

    console.log('Upload successful:', result.secure_url)

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
