// app/api/upload/route.ts
import { NextResponse } from 'next/server'
import { uploadImage } from '@/lib/actions/images'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const { url, publicId } = await uploadImage(file)
    return NextResponse.json({ url, publicId })
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json(
      { error: "Image upload failed" },
      { status: 500 }
    )
  }
}