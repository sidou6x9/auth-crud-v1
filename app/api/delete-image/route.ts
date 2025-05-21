// app/api/delete-image/route.ts
import { NextResponse } from 'next/server'
import { deleteImage } from '@/lib/actions/images'

export async function POST(req: Request) {
  try {
    const { publicId } = await req.json()
    if (!publicId) {
      return NextResponse.json(
        { error: "No public ID provided" },
        { status: 400 }
      )
    }
    await deleteImage(publicId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Image deletion failed:', error)
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    )
  }
}