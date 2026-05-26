interface SocialMediaLinks {
  twitter: string
  linkedin: string
  github: string
  website: string
  behance: string
  figma: string
  awwwards: string
  dribbble: string
  medium: string
  instagram: string
  youtube: string
  spotify: string
  [key: string]: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  published: boolean
  order: number
  createdAt: string
  updatedAt: string
  portfolioId: string
}

export interface ProfileData {
  id: string
  userId: string
  username: string
  fullName: string
  name: string
  profession: string
  headline: string
  photo: string
  theme: string | { style: string; aiGenerated: boolean } // handling both cases
  socialMedia: SocialMediaLinks
  order?: string[]
  projects: {
    id: string
    portfolioId: string
    title: string
    description: string
    link: string
    timeline: string
    coverImage: string
    position: number
    createdAt: string
    updatedAt: string
  }[]
  features: string[]
  achievements: {
    title: string
    issuer: string
    date: string
  }[]
  analytics: {
    views: number
    engagement: number
  }
  blogEnabled: boolean
  blogPosts: BlogPost[]
  collaborators: string[]
  createdAt: string
  updatedAt: string
  isExisting: boolean
}
