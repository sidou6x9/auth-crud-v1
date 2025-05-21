import { z } from 'zod'

export const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  readTime: z.number().or(
    z.string().transform(Number).refine(n => !isNaN(n), "Must be a number")
  ),
  status: z.enum(["draft", "published"]),
  imageUrl: z.string().url().optional().or(z.literal("")),
  cloudinaryPublicId: z.string().optional()
})

export type PostFormValues = z.infer<typeof postSchema>