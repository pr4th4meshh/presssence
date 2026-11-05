/** The parts of the sample portfolio the landing sections show. */
export interface LandingDemo {
  username: string
  fullName: string
  profession: string
  headline: string
  photo: string
  skills: string[]
  projects: Array<{ title: string; description: string; timeline: string }>
}
