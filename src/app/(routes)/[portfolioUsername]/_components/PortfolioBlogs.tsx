"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { FiEdit3, FiTrash2, FiX, FiEye, FiEyeOff, FiPlus } from "react-icons/fi"
import { toast } from "sonner"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd"
import { storage } from "@/lib/firebase"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import BlogCard from "./BlogCard"
import { BlogPost } from "@/types"

interface PortfolioBlogsProps {
  initialPosts: BlogPost[]
  initialBlogEnabled: boolean
  userId: string
}

interface PostForm {
  title: string
  content: string
  coverImage: string
  published: boolean
}

const emptyForm: PostForm = { title: "", content: "", coverImage: "", published: false }

const PortfolioBlogs = ({ initialPosts, initialBlogEnabled, userId }: PortfolioBlogsProps) => {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [blogEnabled, setBlogEnabled] = useState(initialBlogEnabled)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [form, setForm] = useState<PostForm>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [isTogglingBlog, setIsTogglingBlog] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { data: session } = useSession()
  const params = useParams<{ portfolioUsername: string }>()
  const isOwner = session?.user?.id === userId

  const visiblePosts = isOwner ? posts : posts.filter((p) => p.published)

  if (!isOwner && (!blogEnabled || visiblePosts.length === 0)) return null

  const openCreate = () => {
    setEditingPost(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (post: BlogPost) => {
    setEditingPost(post)
    setForm({
      title: post.title,
      content: post.content,
      coverImage: post.coverImage ?? "",
      published: post.published,
    })
    setDialogOpen(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const storageRef = ref(storage, `blogs/${Date.now()}_${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)
    uploadTask.on(
      "state_changed",
      (snap) => setUploadProgress((snap.bytesTransferred / snap.totalBytes) * 100),
      (err) => { console.error(err); toast.error("Image upload failed") },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)
        setForm((f) => ({ ...f, coverImage: url }))
        setUploadProgress(0)
      }
    )
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required")
      return
    }
    setIsSaving(true)
    try {
      if (editingPost) {
        const res = await fetch(`/api/blogs/${editingPost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error()
        const updated: BlogPost = await res.json()
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        toast.success("Post updated")
      } else {
        const res = await fetch("/api/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        if (!res.ok) throw new Error()
        const created: BlogPost = await res.json()
        setPosts((prev) => [...prev, created])
        toast.success("Post created")
      }
      setDialogOpen(false)
    } catch {
      toast.error("Failed to save post")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"?`)) return
    try {
      const res = await fetch(`/api/blogs/${post.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
      toast.success("Post deleted")
    } catch {
      toast.error("Failed to delete post")
    }
  }

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const res = await fetch(`/api/blogs/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      })
      if (!res.ok) throw new Error()
      const updated: BlogPost = await res.json()
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      toast.success(updated.published ? "Post published" : "Post set to draft")
    } catch {
      toast.error("Failed to update post")
    }
  }

  const handleToggleBlogEnabled = async () => {
    setIsTogglingBlog(true)
    try {
      const res = await fetch(`/api/portfolio?portfolioUsername=${params.portfolioUsername}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogEnabled: !blogEnabled }),
      })
      if (!res.ok) throw new Error()
      setBlogEnabled((v) => !v)
      toast.success(!blogEnabled ? "Blog section enabled" : "Blog section hidden")
    } catch {
      toast.error("Failed to update blog settings")
    } finally {
      setIsTogglingBlog(false)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) return
    const reordered = Array.from(visiblePosts)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    setPosts(reordered)
    try {
      await fetch(`/api/portfolio?portfolioUsername=${params.portfolioUsername}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogPostOrder: reordered.map((p) => p.id) }),
      })
    } catch {
      toast.error("Failed to save order")
    }
  }

  return (
    <>
      <div className="section-border py-10 border-t border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-label text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Blog
          </h2>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button
              variant="ghost"
                onClick={handleToggleBlogEnabled}
                disabled={isTogglingBlog}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                title={blogEnabled ? "Hide blog section" : "Show blog section"}
              >
                {blogEnabled ? <FiEye size={13} /> : <FiEyeOff size={13} />}
                {blogEnabled ? "Visible" : "Hidden"}
              </Button>
              <Button size="sm" variant="default" onClick={openCreate} className="gap-1.5 text-xs">
                <FiPlus size={12} />
                New Post
              </Button>
            </div>
          )}
        </div>

        {visiblePosts.length === 0 ? (
          isOwner ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              No posts yet.{" "}
              <button
                onClick={openCreate}
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Write your first post
              </button>
            </div>
          ) : null
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="blogs" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {visiblePosts.map((post, index) => (
                    <Draggable
                      key={post.id}
                      draggableId={post.id}
                      index={index}
                      isDragDisabled={!isOwner}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`relative group/card transition-shadow ${
                            snapshot.isDragging ? "shadow-2xl rotate-1 scale-[1.02]" : ""
                          } ${isOwner ? "cursor-grab active:cursor-grabbing" : ""}`}
                        >
                          <BlogCard post={post} portfolioUsername={params.portfolioUsername} />

                          {isOwner && (
                            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => { e.preventDefault(); handleTogglePublish(post) }}
                                className="w-7 h-7 rounded-lg bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                title={post.published ? "Set to draft" : "Publish"}
                              >
                                {post.published ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); openEdit(post) }}
                                className="w-7 h-7 rounded-lg bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                title="Edit post"
                              >
                                <FiEdit3 size={12} />
                              </button>
                              <button
                                onClick={(e) => { e.preventDefault(); handleDelete(post) }}
                                className="w-7 h-7 rounded-lg bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors"
                                title="Delete post"
                              >
                                <FiTrash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!isSaving) setDialogOpen(open) }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "New Blog Post"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Post title"
                autoFocus
              />
            </div>

            <div>
              <Label>Content</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Write your post..."
                rows={12}
                className="resize-none font-mono text-sm"
              />
            </div>

            <div>
              <Label>Cover Image</Label>
              <div className="relative">
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="absolute bottom-0 left-0 h-0.5 bg-foreground rounded-full"
                  />
                )}
              </div>
              {form.coverImage && (
                <div className="mt-2 relative">
                  <Image
                    src={form.coverImage}
                    alt="Cover preview"
                    width={300}
                    height={150}
                    className="w-full h-36 object-cover rounded-lg border border-border"
                  />
                  <button
                    onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  >
                    <FiX size={11} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
                  className={`w-9 h-5 rounded-full transition-colors relative ${form.published ? "bg-green-500" : "bg-muted"}`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      form.published ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-sm">{form.published ? "Published" : "Draft"}</span>
              </label>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : editingPost ? "Save Changes" : "Create Post"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PortfolioBlogs
