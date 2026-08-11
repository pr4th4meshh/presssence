/**
 * Assertions are deliberately loose — facts that must hold, not exact strings.
 * The model rewords freely, so `headline === "..."` would fail every run.
 */
export type ResumeFixture = {
  name: string
  text: string
  expect: {
    fullName?: string
    minJobs?: number
    maxJobs?: number
    companies?: string[]
    minProjects?: number
    projectTitles?: string[]
    mustHaveSkills?: string[]
    mustNotHaveSkills?: string[]
    socialKeys?: string[]
    /** Roles that must come back with no endDate (currently employed). */
    currentRoleAt?: string
  }
}

export const FIXTURES: ResumeFixture[] = [
  {
    name: "standard-two-jobs",
    text: `PRIYA SHARMA
Bangalore, India | priya.sharma@email.com | +91 98765 43210
github.com/priyasharma  |  linkedin.com/in/priyasharma

SUMMARY
Backend-leaning full stack dev. 4 yrs. Ship fast, break little.

EXPERIENCE
Senior Software Engineer, Razorpay - Bangalore
March 2024 - Present
Led migration of payments ledger to event sourcing.
Cut p99 latency 340ms -> 90ms. Mentored 3 juniors.

Software Engineer, Freshworks - Chennai
June 2021 - Feb 2024
Built multi-tenant notification service handling 12M events/day.

PROJECTS
DevBoard (2024) - github.com/priyasharma/devboard
Self-hosted analytics for indie devs. Next.js + ClickHouse.

kubelog (2023)
CLI that tails and greps logs across k8s pods. Written in Go.

SKILLS
Go, TypeScript, Python, PostgreSQL, ClickHouse, Kafka, Docker,
Kubernetes, AWS, React, Next.js, Redis

EDUCATION
B.E. Computer Science, PES University, 2021`,
    expect: {
      fullName: "Priya Sharma",
      minJobs: 2,
      maxJobs: 2,
      companies: ["Razorpay", "Freshworks"],
      minProjects: 2,
      projectTitles: ["DevBoard", "kubelog"],
      mustHaveSkills: ["Go", "TypeScript", "Kubernetes"],
      socialKeys: ["github", "linkedin"],
      currentRoleAt: "Razorpay",
    },
  },
  {
    // Soft skills must not reach a technical skills list; one job stays one job.
    name: "junior-soft-skills-noise",
    text: `Marcus Chen
marcus.chen@email.com | Toronto, ON

OBJECTIVE
Passionate, detail-oriented team player seeking frontend role.
Excellent communication skills and strong work ethic.

EXPERIENCE
Junior Frontend Developer at Shopify (Remote)
Aug 2025 - Present
Building React components. Improved Lighthouse score from 61 to 94.

SKILLS
HTML, CSS, JavaScript, React, Tailwind, Git
Teamwork, Communication, Leadership, Time Management, Problem Solving`,
    expect: {
      fullName: "Marcus Chen",
      minJobs: 1,
      maxJobs: 1,
      companies: ["Shopify"],
      mustHaveSkills: ["React", "JavaScript"],
      mustNotHaveSkills: ["Teamwork", "Communication", "Leadership"],
      currentRoleAt: "Shopify",
    },
  },
  {
    // Catches invention: a rich schema fed three lines can fabricate a career.
    name: "sparse-minimal",
    text: `Ana Gutierrez
Product Designer
ana@anagutierrez.design`,
    expect: {
      fullName: "Ana Gutierrez",
      minJobs: 0,
      maxJobs: 0,
      minProjects: 0,
    },
  },
]
