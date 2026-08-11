/**
 * Eval harness for resume extraction.
 *
 *   npx tsx --conditions=react-server --env-file=.env scripts/eval-resume.mts [runs]
 *
 * LLM output is non-deterministic, so a single passing run proves nothing.
 * Each fixture runs N times and reports a pass rate per assertion; exits
 * non-zero so it can gate CI.
 */
import { extractResume, type ResumeExtraction } from "@/lib/ai/resume"
import { FIXTURES, type ResumeFixture } from "./fixtures/resumes"

const RUNS = Number(process.argv[2] ?? 3)

// Paces requests so the per-minute quota doesn't force retries that eat the
// daily budget. The provider retries 429s, but avoiding them is cheaper.
const DELAY_MS = Number(process.env.EVAL_DELAY_MS ?? 4000)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type Check = { label: string; pass: boolean; detail?: string }

const norm = (s: string) => s.trim().toLowerCase()

/** Non-Latin characters indicate reasoning leaked into a field. */
function findJunk(value: unknown, path = ""): string[] {
  if (typeof value === "string") {
    return /[^\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/u.test(value)
      ? [`${path}=${JSON.stringify(value.slice(0, 60))}`]
      : []
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => findJunk(v, path ? `${path}.${k}` : k))
  }
  return []
}

function evaluate(fixture: ResumeFixture, got: ResumeExtraction): Check[] {
  const e = fixture.expect
  const checks: Check[] = []
  const add = (label: string, pass: boolean, detail?: string) =>
    checks.push({ label, pass, detail })

  if (e.fullName !== undefined) {
    add("fullName", norm(got.fullName) === norm(e.fullName), got.fullName)
  }
  if (e.minJobs !== undefined) {
    add(`jobs>=${e.minJobs}`, got.workExperience.length >= e.minJobs, `${got.workExperience.length}`)
  }
  if (e.maxJobs !== undefined) {
    add(`jobs<=${e.maxJobs}`, got.workExperience.length <= e.maxJobs, `${got.workExperience.length}`)
  }
  if (e.companies) {
    const found = got.workExperience.map((w) => norm(w.company))
    for (const c of e.companies) add(`company:${c}`, found.includes(norm(c)))
  }
  if (e.minProjects !== undefined) {
    add(`projects>=${e.minProjects}`, got.projects.length >= e.minProjects, `${got.projects.length}`)
  }
  if (e.projectTitles) {
    const found = got.projects.map((p) => norm(p.title))
    for (const t of e.projectTitles) add(`project:${t}`, found.includes(norm(t)))
  }
  if (e.mustHaveSkills) {
    const found = got.skills.map(norm)
    for (const s of e.mustHaveSkills) add(`skill:${s}`, found.includes(norm(s)))
  }
  if (e.mustNotHaveSkills) {
    const found = got.skills.map(norm)
    for (const s of e.mustNotHaveSkills) add(`no-soft-skill:${s}`, !found.includes(norm(s)))
  }
  if (e.socialKeys) {
    for (const k of e.socialKeys) {
      add(`social:${k}`, Boolean((got.socialLinks as Record<string, unknown>)[k]))
    }
  }
  if (e.currentRoleAt) {
    const role = got.workExperience.find((w) => norm(w.company) === norm(e.currentRoleAt!))
    add(
      `current-role-has-no-endDate:${e.currentRoleAt}`,
      Boolean(role) && !role?.endDate,
      role?.endDate ?? "(omitted)"
    )
  }

  const junk = findJunk(got)
  add("no-leaked-reasoning", junk.length === 0, junk.join(" | ") || undefined)

  return checks
}

const tally = new Map<string, { pass: number; total: number; details: Set<string> }>()
let totalTokens = 0
let hardFailures = 0

for (const fixture of FIXTURES) {
  console.log(`\n=== ${fixture.name} (${RUNS} runs) ===`)
  for (let run = 1; run <= RUNS; run++) {
    if (run > 1) await sleep(DELAY_MS)
    let checks: Check[]
    try {
      const result = await extractResume({ text: fixture.text })
      totalTokens += result.usage.total
      checks = evaluate(fixture, result.data)
    } catch (error) {
      hardFailures++
      console.log(`  run ${run}: THREW — ${(error as Error).message.slice(0, 160)}`)
      continue
    }
    const failed = checks.filter((c) => !c.pass)
    console.log(
      `  run ${run}: ${checks.length - failed.length}/${checks.length}` +
        (failed.length ? `  ✗ ${failed.map((f) => f.label).join(", ")}` : "  ✓")
    )
    for (const c of checks) {
      const key = `${fixture.name} :: ${c.label}`
      const entry = tally.get(key) ?? { pass: 0, total: 0, details: new Set<string>() }
      entry.total++
      if (c.pass) entry.pass++
      else if (c.detail) entry.details.add(c.detail)
      tally.set(key, entry)
    }
  }
}

console.log(`\n${"=".repeat(70)}\nFLAKY / FAILING CHECKS (anything below 100%)\n${"=".repeat(70)}`)
const problems = [...tally.entries()].filter(([, v]) => v.pass < v.total)
if (problems.length === 0) {
  console.log("  none — all checks passed on every run")
} else {
  for (const [key, v] of problems.sort((a, b) => a[1].pass / a[1].total - b[1].pass / b[1].total)) {
    const pct = Math.round((v.pass / v.total) * 100)
    console.log(`  ${String(pct).padStart(3)}%  ${key}`)
    for (const d of [...v.details].slice(0, 2)) console.log(`         got: ${d}`)
  }
}

const allChecks = [...tally.values()]
const passed = allChecks.reduce((n, v) => n + v.pass, 0)
const total = allChecks.reduce((n, v) => n + v.total, 0)
console.log(
  `\nOverall: ${passed}/${total} (${Math.round((passed / total) * 100)}%) | ` +
    `hard failures: ${hardFailures} | tokens: ${totalTokens}`
)

process.exit(problems.length > 0 || hardFailures > 0 ? 1 : 0)
