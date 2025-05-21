"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useDropzone } from "react-dropzone"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, Clock, User, ImageIcon, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { postSchema } from "@/lib/validations/posts"

export default function EditPostPage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState<string | null>(null)

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      readTime: 5,
      status: "draft",
      imageUrl: "",
      cloudinaryPublicId: ""
    }
  })

  const { register, watch, handleSubmit, setValue, reset, formState: { errors }, getValues } = form
  const watchedValues = watch()

  // Initialize dropzone
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      const previewUrl = URL.createObjectURL(file)
      setCurrentImage(previewUrl)
      await handleImageUpload(file)
    }
  })

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${id}`)
        const post = await response.json()
        
        if (response.ok) {
          reset({
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            readTime: post.readTime,
            status: post.status,
            imageUrl: post.imageUrl,
            cloudinaryPublicId: post.cloudinaryPublicId
          })
          setCurrentImage(post.imageUrl)
        } else {
          throw new Error("Failed to fetch post")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Couldn't load post data",
          variant: "destructive"
        })
        router.push("/admin/posts")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [id, reset, router])

  // Handle image upload to Cloudinary
  const handleImageUpload = async (file: File) => {
    try {
      // Get current public ID before uploading new image
      const currentPublicId = getValues("cloudinaryPublicId")
      
      // Upload new image
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const { url, publicId } = await response.json()
      
      // Delete old image if it exists
      if (currentPublicId) {
        try {
          await fetch('/api/delete-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId: currentPublicId })
          })
        } catch (error) {
          console.error("Failed to delete old image", error)
          // Continue even if deletion fails
        }
      }
      
      // Update form with new image
      setValue("imageUrl", url)
      setValue("cloudinaryPublicId", publicId)
      setCurrentImage(url)
      return url
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Couldn't upload image",
        variant: "destructive"
      })
      return null
    }
  }

  // Handle image removal
  const handleRemoveImage = async () => {
    const currentPublicId = getValues("cloudinaryPublicId")
    
    if (currentPublicId) {
      try {
        await fetch('/api/delete-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: currentPublicId })
        })
      } catch (error) {
        console.error("Failed to delete image", error)
        // Continue with removal even if deletion fails
      }
    }
    
    setValue("imageUrl", "")
    setValue("cloudinaryPublicId", "")
    setCurrentImage(null)
  }

  // Form submission
const onSubmit = async (data: any) => {
  if (!session?.user?.id) return
  
  try {
    setIsSubmitting(true)
    const response = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        // Ensure we don't send null/undefined values
        imageUrl: data.imageUrl || null,
        cloudinaryPublicId: data.cloudinaryPublicId || null
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update post")
    }

    router.push("/admin/posts")
    toast({ title: "Post updated successfully!" })
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Update failed",
      variant: "destructive"
    })
  } finally {
    setIsSubmitting(false)
  }
}

  // Clean up image preview
  useEffect(() => {
    return () => {
      if (currentImage && currentImage.startsWith('blob:')) {
        URL.revokeObjectURL(currentImage)
      }
    }
  }, [currentImage])

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Edit Post</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Post Title*</Label>
                  <Input 
                    id="title" 
                    placeholder="Enter post title" 
                    {...register("title")} 
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title.message}</p>
                  )}
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Short Excerpt*</Label>
                  <Input
                    id="excerpt"
                    placeholder="Brief description of your post"
                    {...register("excerpt")}
                  />
                  {errors.excerpt && (
                    <p className="text-red-500 text-sm">{errors.excerpt.message}</p>
                  )}
                </div>

                {/* Read Time */}
                <div className="space-y-2">
                  <Label htmlFor="readTime">Read Time (minutes)*</Label>
                  <Input
                    id="readTime"
                    type="number"
                    {...register("readTime", { valueAsNumber: true })}
                  />
                  {errors.readTime && (
                    <p className="text-red-500 text-sm">{errors.readTime.message}</p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status*</Label>
                  <RadioGroup 
                    value={watchedValues.status}
                    onValueChange={(value) => setValue("status", value)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="draft" id="draft" />
                      <Label htmlFor="draft">Draft</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="published" id="published" />
                      <Label htmlFor="published">Published</Label>
                    </div>
                  </RadioGroup>
                  {errors.status && (
                    <p className="text-red-500 text-sm">{errors.status.message}</p>
                  )}
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Featured Image</Label>
                  {currentImage ? (
                    <div className="relative group">
                      <div className="relative h-48 w-full rounded-md overflow-hidden">
                        <Image
                          src={currentImage}
                          alt="Current featured"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      {...getRootProps()}
                      className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drag & drop an image here, or click to select
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <Tabs defaultValue="write">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="write" className="space-y-2">
                    <Label htmlFor="content">Content*</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your post content here..."
                      className="min-h-[300px]"
                      {...register("content")}
                    />
                    {errors.content && (
                      <p className="text-red-500 text-sm">{errors.content.message}</p>
                    )}
                  </TabsContent>
                  <TabsContent value="preview">
                    <div className="border rounded-md p-4 min-h-[300px] prose max-w-none">
                      {watchedValues.content ? (
                        <div dangerouslySetInnerHTML={{ __html: watchedValues.content.replace(/\n/g, "<br />") }} />
                      ) : (
                        <p className="text-muted-foreground">Your content preview will appear here...</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Post"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div>
          <div className="sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Post Preview</h2>
            <Card className="overflow-hidden">
              {currentImage ? (
                <div className="relative h-56 w-full">
                  <Image 
                    src={currentImage} 
                    alt="Featured preview" 
                    fill 
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="bg-muted h-56 flex items-center justify-center">
                  <p className="text-muted-foreground">Featured image preview</p>
                </div>
              )}

              <CardContent className="pt-6">
                <h1 className="text-2xl font-bold mb-2">
                  {watchedValues.title || "Your Post Title"}
                </h1>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{currentDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{watchedValues.readTime || 5} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{session?.user?.name || "Author"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="capitalize">{watchedValues.status || "draft"}</span>
                  </div>
                </div>

                {watchedValues.excerpt && (
                  <p className="text-muted-foreground mb-4 italic">
                    {watchedValues.excerpt}
                  </p>
                )}

                <div className="prose max-w-none mb-4">
                  {watchedValues.content ? (
                    <div dangerouslySetInnerHTML={{ 
                      __html: watchedValues.content.replace(/\n/g, "<br />") 
                    }} />
                  ) : (
                    <p className="text-muted-foreground">
                      Your content preview will appear here...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}