import { z } from "zod"

export const SignupSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  password: z.string(),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// frontend validation
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
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores").toLowerCase(),
  fullName: z.string().min(2).max(50),
  profession: z.string().min(2).max(50),
  headline: z.string().max(160),
  theme: z
    .enum(["modern", "creative", "professional", "bold"])
    .default("modern"),
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
  socialLinks: z.object({
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
  }),
  blogEnabled: z.boolean(),
  analyticsEnabled: z.boolean(),
})

export type FormData = z.infer<typeof formSchema>