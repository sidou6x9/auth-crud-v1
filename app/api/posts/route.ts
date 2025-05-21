// app/api/posts/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPosts, createPost } from '@/lib/actions/posts'

export async function GET() {
  try {
    const posts = await getPosts()
    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const post = await createPost(body, session.user.id)
    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Post creation failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid post data" },
      { status: 400 }
    )
  }
}