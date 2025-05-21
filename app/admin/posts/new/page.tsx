"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useDropzone } from "react-dropzone"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, Clock, User, ImageIcon, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { postSchema } from "@/lib/validations/posts"

export default function CreatePostPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

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

  const { register, watch, handleSubmit, setValue, control, formState: { errors } } = form
  const watchedValues = watch()

  // Handle image upload to Cloudinary
  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const { url, publicId } = await response.json()
      setValue("imageUrl", url)
      setValue("cloudinaryPublicId", publicId)
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

  // Dropzone configuration
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      await handleImageUpload(file)
    }
  })

  // Form submission
  const onSubmit = async (data: any) => {
    if (!session?.user?.id) return
    
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          authorId: session.user.id
        })
      })

      if (response.ok) {
        router.push("/admin/posts")
        toast({ title: "Post created successfully!" })
      } else {
        throw new Error("Failed to create post")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Couldn't create post",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Clean up image preview
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Create New Post</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Form */}
        <div className="space-y-6">
             <h2 className="text-xl font-semibold mb-4">Post Form</h2>
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
                    defaultValue="draft"
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
                      {watchedValues.imageUrl && (
                        <p className="text-xs text-green-600">Image uploaded successfully!</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <Tabs defaultValue="write">
                
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
                      Publishing...
                    </>
                  ) : (
                    "Publish Post"
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
              {watchedValues.imageUrl ? (
                <div className="relative h-56 w-full">
                  <Image 
                    src={watchedValues.imageUrl} 
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