import { z } from "zod"
import { NextResponse } from "next/server"

export async function parseBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return { error: NextResponse.json({ message: "Invalid JSON body" }, { status: 400 }) }
  }
  const result = schema.safeParse(body)
  if (!result.success) {
    return {
      error: NextResponse.json(
        { message: "Validation error", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      ),
    }
  }
  return { data: result.data }
}

export const SocialLinksSchema = z.object({
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  medium: z.string().optional(),
  website: z.string().optional(),
  behance: z.string().optional(),
  figma: z.string().optional(),
  awwwards: z.string().optional(),
  dribbble: z.string().optional(),
  spotify: z.string().optional(),
}).partial()

export const ProjectInputSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).default(""),
  link: z.string().url().optional().or(z.literal("")),
  timeline: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
})

export const SignupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(30),
  password: z.string().min(6),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const SignupSchemaFrontend = z.object({
  email: z.string().email(),
  name: z.string().min(3),
  password: z.string().min(6),
})

export const LoginSchemaFrontend = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type FormFields = z.infer<typeof SignupSchemaFrontend>
export type LoginFields = z.infer<typeof LoginSchemaFrontend>

export const formSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores")
    .toLowerCase(),
  fullName: z.string().min(2).max(50),
  profession: z.string().min(2).max(50),
  headline: z.string().max(160),
  theme: z.enum(["modern", "creative", "professional", "bold"]).default("modern"),
  features: z.any(),
  projects: z.array(
    z.object({
      title: z.string().min(3).max(50),
      description: z.string().max(500),
      link: z.string().url("Enter a valid URL").optional(),
      timeline: z.string(),
      coverImage: z.string().optional(),
    })
  ),
  socialLinks: SocialLinksSchema,
  blogEnabled: z.boolean(),
  analyticsEnabled: z.boolean(),
})

export type FormData = z.infer<typeof formSchema>

export const CreatePortfolioSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
  fullName: z.string().min(1).max(50),
  profession: z.string().min(1).max(50),
  headline: z.string().max(160).optional().default(""),
  theme: z.string().default("modern"),
  features: z.array(z.string()),
  projects: z.array(ProjectInputSchema),
  socialLinks: SocialLinksSchema,
  blogEnabled: z.boolean().default(false),
})

export const UpdatePortfolioSchema = z.object({
  fullName: z.string().min(1).max(50).optional(),
  profession: z.string().min(1).max(50).optional(),
  headline: z.string().max(160).optional(),
  theme: z.string().optional(),
  features: z.array(z.string()).optional(),
  blogEnabled: z.boolean().optional(),
  blogPostOrder: z.array(z.string()).optional(),
  socialLinks: SocialLinksSchema.optional(),
  socialLinksOrder: z.array(z.string()).optional(),
  projects: z
    .array(
      ProjectInputSchema.extend({
        id: z.string().optional(),
        position: z.number().int().optional(),
      })
    )
    .optional(),
})

export type UpdatePortfolioData = z.infer<typeof UpdatePortfolioSchema>

export const CreateWorkExperienceSchema = z.object({
  company: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  description: z.string().max(1000).optional(),
  location: z.string().max(100).optional(),
  portfolioUsername: z.string().min(1),
})

export const UpdateWorkExperienceSchema = z.object({
  company: z.string().min(1).max(100).optional(),
  role: z.string().min(1).max(100).optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  position: z.number().int().optional(),
})

export const CreateBlogSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  coverImage: z.string().optional(),
  published: z.boolean().default(false),
})

export const UpdateBlogSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  coverImage: z.string().nullable().optional(),
  published: z.boolean().optional(),
})

export const CreatePhotoSchema = z.object({
  url: z.string().url(),
  portfolioUsername: z.string().min(1),
  w: z.number().int().min(1).max(2).default(1),
  h: z.number().int().min(1).max(2).default(1),
  x: z.number().int().min(0).default(0),
  y: z.number().int().min(0).default(0),
})

export const PhotoLayoutItemSchema = z.object({
  id: z.string().min(1),
  x: z.number().int(),
  y: z.number().int(),
  w: z.number().int().min(1).max(2),
  h: z.number().int().min(1).max(2),
})

export const PhotoLayoutSchema = z.object({
  portfolioUsername: z.string().min(1),
  layout: z.array(PhotoLayoutItemSchema),
})

export const UpdateUserPhotoSchema = z.object({
  photoUrl: z.string().url(),
})

export const CheckUsernameSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
})
