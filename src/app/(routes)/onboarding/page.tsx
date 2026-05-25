"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { formSchema, FormData } from "@/lib/zod"
import BasicInfoStep from "./_components/BasicInfoStep"
import ProfessionalDetailsStep from "./_components/ProfessionalDetailsStep"
import ProjectsStep from "./_components/ProjectsStep"
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

export default function OnboardingForm() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setValue,
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

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      const filteredSocialLinks = Object.fromEntries(
        Object.entries(data.socialLinks).filter(
          ([, value]) => value && (value as string).trim() !== ""
        )
      )
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          socialLinks: filteredSocialLinks,
          features: selectedFeatures,
        }),
      })
      if (!res.ok) {
        toast.error("Failed to create portfolio. Please try again.")
        return
      }
      toast.success("Portfolio created!")
      router.push(`/${data.username}`)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const totalSteps = STEPS.length

  const steps = [
    <BasicInfoStep
      key="basic"
      register={register}
      errors={errors}
      watch={watch}
      setValue={setValue}
    />,
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
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              setStep={setStep}
              isLoading={isLoading}
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
