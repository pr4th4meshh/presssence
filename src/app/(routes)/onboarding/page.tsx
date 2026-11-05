"use client"

import { useState } from "react"
import { useForm, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { formSchema, FormData } from "@/lib/validations"
import BasicInfoStep from "./_components/BasicInfoStep"
import ProfessionalDetailsStep from "./_components/ProfessionalDetailsStep"
import ProjectsStep from "./_components/ProjectsStep"
import ResumeImport from "./_components/ResumeImport"
import SocialMediaStep from "./_components/SocialMediaStep"
import StepNavigation from "./_components/StepNavigation"
import ThemeSelectionStep from "./_components/ThemeSelectionStep"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { CheckCircle2 } from "lucide-react"

const STEPS = [
  { label: "Identity",  short: "You" },
  { label: "Skills",    short: "Skills" },
  { label: "Style",     short: "Style" },
  { label: "Projects",  short: "Work" },
  { label: "Socials",   short: "Links" },
]

const STEP_SUBTITLES = [
  "Choose a username and tell us about yourself.",
  "List the technologies and skills you work with.",
  "Choose how your portfolio looks.",
  "Add your best work to impress visitors.",
  "Link your profiles so people can find you.",
]

const STEP_TITLES = [
  "Set up your identity",
  "Showcase your skills",
  "Pick your style",
  "Add your projects",
  "Connect your socials",
]

/** Fields validated before leaving each step. Index matches STEPS. */
const STEP_FIELDS: (keyof FormData)[][] = [
  ["username", "fullName"],
  ["profession", "headline"],
  ["theme"],
  ["projects"],
  ["socialLinks"],
]

function firstStepWithError(errors: FieldErrors<FormData>): number {
  const index = STEP_FIELDS.findIndex((fields) => fields.some((f) => errors[f]))
  return index === -1 ? 1 : index + 1
}

/** Roles from a resume, held until the portfolio row exists to attach them to. */
type PendingRole = {
  company: string
  role: string
  startDate: string
  endDate?: string
  location?: string
  description?: string
}

export default function OnboardingForm() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [pendingRoles, setPendingRoles] = useState<PendingRole[]>([])
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    trigger,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: "modern",
      blogEnabled: false,
      analyticsEnabled: false,
      features: [],
      headline: "",
      projects: [{ title: "", description: "", link: "", timeline: "" }],
      socialLinks: {
        twitter: "",
        linkedin: "",
        github: "",
        instagram: "",
        youtube: "",
        medium: "",
        website: "",
        behance: "",
        figma: "",
        awwwards: "",
        dribbble: "",
        spotify: "",
      },
    },
  })

  const [checkingUsername, setCheckingUsername] = useState(false)

  /** Server-side availability check; the field validation only covers format. */
  const ensureUsernameAvailable = async (username: string): Promise<boolean> => {
    setCheckingUsername(true)
    try {
      const res = await fetch("/api/checkUsername", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      })
      const data = await res.json()
      if (res.ok && data.available) return true
      setError("username", { message: data.reason ?? "That username is already taken" })
      return false
    } catch {
      toast.error("Couldn't check that username. Check your connection and try again.")
      return false
    } finally {
      setCheckingUsername(false)
    }
  }

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step - 1], { shouldFocus: true })
    if (!valid) return
    if (step === 1 && !(await ensureUsernameAvailable(watch("username")))) return
    setStep((s) => Math.min(s + 1, STEPS.length))
  }

  const goBack = () => setStep((s) => Math.max(s - 1, 1))

  const onInvalid = (formErrors: FieldErrors<FormData>) => {
    setStep(firstStepWithError(formErrors))
    toast.error("A few details need fixing before we can publish.")
  }

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      const filteredSocialLinks = Object.fromEntries(
        Object.entries(data.socialLinks).filter(
          ([, value]) => value && (value as string).trim() !== ""
        )
      )
      const projects = data.projects
        .filter((p) => p.title.trim())
        .map((p) => ({ ...p, title: p.title.trim() }))

      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          projects,
          socialLinks: filteredSocialLinks,
          features: selectedFeatures,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        if (res.status === 409 && body.username) {
          // Already onboarded (e.g. a second tab); send them to what they have.
          router.replace(`/${body.username}`)
          return
        }
        if (res.status === 409) {
          setError("username", { message: body.message ?? "That username is already taken" })
          setStep(1)
        }
        toast.error(body.message ?? "Failed to create portfolio. Please try again.")
        return
      }

      // Sequential, not parallel: /api/work-experience derives `position` from
      // the current row count, so concurrent writes race for the same index.
      if (pendingRoles.length > 0) {
        try {
          for (const role of pendingRoles) {
            await fetch("/api/work-experience", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...role, portfolioUsername: data.username }),
            })
          }
        } catch {
          // Portfolio itself succeeded; don't fail the flow over re-addable rows.
          toast.warning("Portfolio created, but some work history didn't save.")
        }
      }

      toast.success("Your portfolio is live!")
      router.replace(`/${data.username}`)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const totalSteps = STEPS.length

  const steps = [
    <div key="basic" className="space-y-6">
      <ResumeImport
        setValue={setValue}
        onApplied={(extraction) => {
          // Submitted from `selectedFeatures`, so setValue("features") alone is dropped.
          if (extraction.skills.length) setSelectedFeatures(extraction.skills)
          setPendingRoles(extraction.workExperience)
        }}
      />
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        <span className="text-xs uppercase tracking-wide text-neutral-400">or fill it in</span>
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      </div>
      <BasicInfoStep
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
      />
    </div>,
    <ProfessionalDetailsStep
      key="professional"
      register={register}
      errors={errors}
      control={control}
      selectedFeatures={selectedFeatures}
      setSelectedFeatures={setSelectedFeatures}
    />,
    <ThemeSelectionStep
      key="theme"
      register={register}
      watch={watch}
      setValue={setValue}
    />,
    <ProjectsStep
      key="projects"
      control={control}
      watch={watch}
      register={register}
      errors={errors}
      setValue={setValue}
    />,
    <SocialMediaStep key="social" register={register} watch={watch} />,
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold text-foreground mb-8">
        Presssence
      </Link>

      <div className="w-full max-w-lg">
        {/* Step dots */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const num = i + 1
              const isCompleted = step > num
              const isCurrent = step === num

              return (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300
                      ${isCompleted ? "bg-green-500 text-white" : isCurrent ? "bg-foreground text-background ring-2 ring-foreground/20 ring-offset-2" : "bg-muted text-muted-foreground"}`}
                  >
                    {isCompleted ? <CheckCircle2 size={14} /> : num}
                  </div>
                  <span className={`text-[10px] font-medium hidden sm:block transition-colors ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                    {s.short}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-black rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="mb-5">
            <h1 className="text-xl font-bold text-foreground">
              {STEP_TITLES[step - 1]}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {STEP_SUBTITLES[step - 1]}
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            // Enter in a single-line input would otherwise submit the whole
            // form from step 1. Fields that use Enter (skills) handle it first.
            onKeyDown={(e) => {
              const target = e.target as HTMLElement
              if (e.key === "Enter" && target.tagName === "INPUT" && !e.defaultPrevented) {
                e.preventDefault()
                if (step < totalSteps) goNext()
              }
            }}
            noValidate
            className="space-y-5"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
              >
                {steps[step - 1]}
              </motion.div>
            </AnimatePresence>

            <StepNavigation
              currentStep={step}
              totalSteps={totalSteps}
              onNext={goNext}
              onBack={goBack}
              isLoading={isLoading}
              isValidating={checkingUsername}
            />
          </form>
        </div>

        <p className="text-center mt-4 text-xs text-muted-foreground">
          Step {step} of {totalSteps} — {STEPS[step - 1].label}
        </p>
      </div>
    </div>
  )
}
