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

/** Top-level paths the app owns; a portfolio with one of these names would be unreachable. */
export const RESERVED_USERNAMES = new Set([
  "api", "auth", "onboarding", "login", "signup", "register", "logout", "settings",
  "dashboard", "account", "admin", "blog", "about", "pricing", "help", "support",
  "terms", "privacy", "static", "public", "assets", "_next", "favicon", "robots",
  "sitemap", "presssence", "www", "app", "me",
])

export const UsernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be 20 characters or fewer")
  .regex(/^[a-z0-9_]+$/, "Use only lowercase letters, numbers, and underscores")
  .refine((u) => !RESERVED_USERNAMES.has(u), "That username is reserved")

// Unset platforms come back from the database as null, and clients send the
// object they loaded, so null must be accepted alongside a string.
const optionalLink = z.string().nullish()

export const SocialLinksSchema = z.object({
  twitter: optionalLink,
  linkedin: optionalLink,
  github: optionalLink,
  instagram: optionalLink,
  youtube: optionalLink,
  medium: optionalLink,
  website: optionalLink,
  behance: optionalLink,
  figma: optionalLink,
  awwwards: optionalLink,
  dribbble: optionalLink,
  spotify: optionalLink,
})

export const ProjectInputSchema = z.object({
  title: z.string().trim().min(1).max(100),
  description: z.string().max(500).nullish().transform((v) => v ?? ""),
  // Same as social links: optional columns load as null.
  link: z.string().url().nullish().or(z.literal("")),
  timeline: z.string().nullish().transform((v) => v ?? ""),
  coverImage: z.string().nullish().transform((v) => v ?? ""),
})

export const SignupSchemaFrontend = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  name: z.string().trim().min(2, "Enter your name").max(50),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(72, "Use 72 characters or fewer"), // bcrypt ignores bytes past 72
})

export const LoginSchemaFrontend = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
})

/** Only same-site paths, so ?callbackUrl= can't redirect users off-site. */
export function safeCallbackUrl(value: string | null | undefined, fallback = "/me"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback
  }
  return value
}

export type FormFields = z.infer<typeof SignupSchemaFrontend>
export type LoginFields = z.infer<typeof LoginSchemaFrontend>

export const formSchema = z.object({
  username: UsernameSchema,
  fullName: z.string().trim().min(2, "Enter your name").max(50),
  profession: z.string().trim().min(2, "Tell people what you do").max(50),
  headline: z.string().max(160, "Keep it under 160 characters").optional().default(""),
  theme: z.enum(["modern", "creative", "professional", "bold"]).default("modern"),
  features: z.any(),
  // Projects are optional: a row left completely blank is dropped on submit,
  // but a row with any content needs a title.
  projects: z.array(
    z
      .object({
        title: z.string().max(100),
        description: z.string().max(500).optional().default(""),
        link: z.string().url("Enter a valid URL, including https://").optional().or(z.literal("")),
        timeline: z.string().optional().default(""),
        coverImage: z.string().optional(),
      })
      .superRefine((p, ctx) => {
        const hasContent = Boolean(p.description?.trim() || p.link?.trim() || p.timeline || p.coverImage)
        if (hasContent && !p.title.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["title"], message: "Give this project a title" })
        }
      })
  ),
  socialLinks: SocialLinksSchema,
  blogEnabled: z.boolean(),
  analyticsEnabled: z.boolean(),
})

export type FormData = z.infer<typeof formSchema>

export const CreatePortfolioSchema = z.object({
  username: UsernameSchema,
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
  username: z.string(),
})
