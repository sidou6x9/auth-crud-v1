// lib/actions/posts.ts
import { prisma } from '@/lib/prisma'
import { postSchema } from '@/lib/validations/posts'
import { deleteImage } from './images'

type PostData = {
  title: string
  excerpt: string
  content: string
  readTime: number
  status: 'draft' | 'published'
  imageUrl?: string | null
  cloudinaryPublicId?: string | null
}

export const getPosts = async () => {
  return await prisma.post.findMany({
    include: { author: { select: { name: true, image: true } } },
    orderBy: { createdAt: 'desc' }
  })
}

export const getPost = async (id: string) => {
  return await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { name: true, image: true } } }
  })
}

export const createPost = async (data: PostData, authorId: string) => {
  const validated = postSchema.parse(data)
  return await prisma.post.create({
    data: {
      ...validated,
      readTime: Number(validated.readTime),
      authorId
    }
  })
}

export const updatePost = async (id: string, data: PostData) => {
  const validated = postSchema.parse(data)
  const currentPost = await prisma.post.findUnique({ where: { id } })

  if (currentPost?.cloudinaryPublicId && 
      (!validated.cloudinaryPublicId || 
       validated.cloudinaryPublicId !== currentPost.cloudinaryPublicId)) {
    const deletionSuccess = await deleteImage(currentPost.cloudinaryPublicId)
    if (!deletionSuccess) {
      console.warn('Failed to delete old image, continuing anyway')
    }
  }
  
  return await prisma.post.update({
    where: { id },
    data: validated
  })
}

export const deletePost = async (id: string) => {
  const post = await prisma.post.findUnique({
    where: { id }
  })

  if (!post) {
    throw new Error("Post not found")
  }

  if (post.cloudinaryPublicId) {
    await deleteImage(post.cloudinaryPublicId)
  }

  return await prisma.post.delete({
    where: { id }
  })
}