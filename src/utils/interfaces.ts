export interface ProfileData {
    userId: string
    username: string
    name: string
    profession: string
    headline: string
    photo: string
    theme: {
      style: string
      aiGenerated: boolean
    }
    socialMedia: {
      twitter: string
      linkedin: string
      github: string
      website: string
      behance: string
      figma: string
      awwwards: string
      dribbble: string
      medium: string
      instgram: string
      youtube: string
    }
    projects: {
      title: string
      description: string
      link: string
      timeline: string
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
    collaborators: string[]
  }