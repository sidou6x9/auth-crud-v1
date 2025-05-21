// lib/actions/images.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export const uploadImage = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'blog-posts',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) reject(error)
        else resolve({
          url: result!.secure_url,
          publicId: result!.public_id
        })
      }
    ).end(buffer)
  })
}
export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('Cloudinary deletion error:', error)
    return false // Graceful fallback
  }
}