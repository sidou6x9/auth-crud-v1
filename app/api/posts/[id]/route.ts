// app/api/posts/[id]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPost, updatePost, deletePost } from '@/lib/actions/posts'
import { handleApiError } from '@/lib/middleware/error'

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    
    const post = await getPost(params.id)
    return post 
      ? NextResponse.json(post)
      : NextResponse.json({ error: "Post not found" }, { status: 404 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id  = params.id // Proper destructuring
    const body = await req.json()
    const post = await updatePost(id, body)
    
    return NextResponse.json(post)
  } catch (error) {
    return handleApiError(error)
  }
}


export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await deletePost(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Deletion failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete post" },
      { status: 500 }
    )
  }
}