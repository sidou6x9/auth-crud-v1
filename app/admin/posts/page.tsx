// app/admin/posts/page.tsx
import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function PostsPage() {
  const session = await auth()
  if (!session) {
    redirect("/auth/login")
  }

  // Fetch posts directly from Prisma since we're in server component
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          name: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Posts</h1>
        <Link
          href="/admin/posts/new"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          New Post
        </Link>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row">
              {/* Image */}
              <div className="md:w-1/3 relative h-48">
                <Image
                  src={post.imageUrl || "/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover rounded-t-md md:rounded-l-md md:rounded-tr-none"
                />
              </div>

              {/* Content */}
              <CardContent className="md:w-2/3 p-4">
                <div className="flex justify-between items-start gap-2">
                  <h2 className="text-lg font-bold line-clamp-2">{post.title}</h2>
                  <span className={`px-2 py-1 rounded-md text-xs capitalize ${
                    post.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status}
                  </span>
                </div>

                <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{post.author?.name || "You"}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 text-sm">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-gray-500 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}