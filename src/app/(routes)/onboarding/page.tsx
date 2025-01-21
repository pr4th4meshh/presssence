"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { WavyBackground } from "@/components/ui/wavy-background"
import { formSchema, FormData } from "@/lib/zod"
import BasicInfoStep from "./_components/BasicInfoStep"
import ProfessionalDetailsStep from "./_components/ProfessionalDetailsStep"
import ProjectsStep from "./_components/ProjectsStep"
import SocialMediaStep from "./_components/SocialMediaStep"
import StepNavigation from "./_components/StepNavigation"
import ThemeSelectionStep from "./_components/ThemeSelectionStep"

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
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      const filteredSocialLinks = Object.fromEntries(
        Object.entries(data.socialLinks).filter(([value]) => value && value.trim() !== "")
      )
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, socialLinks: filteredSocialLinks,  features: selectedFeatures }),
      })
      if (!res.ok) throw new Error("Failed to create portfolio")
      router.push(`/${data.username}`)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    <BasicInfoStep key="basic" register={register} errors={errors} watch={watch} setValue={setValue} />,
    <ProfessionalDetailsStep 
      key="professional" 
      register={register} 
      errors={errors} 
      control={control}
      selectedFeatures={selectedFeatures}
      setSelectedFeatures={setSelectedFeatures}
    />,
    <ThemeSelectionStep key="theme" register={register} watch={watch} setValue={setValue} />,
    <ProjectsStep key="projects" control={control} watch={watch} register={register} errors={errors} />,
    <SocialMediaStep key="social" register={register} />,
  ]

  return (
    <WavyBackground>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full sm:w-[600px] max-w-lg dark:bg-black dark:text-white text-black bg-white shadow-sm dark:shadow-white rounded-lg p-6">
          <h1 className="text-2xl font-semibold mb-4">Create Your Enhanced Portfolio</h1>
          <p className="text-sm text-gray-500 mb-6">Step {step} of {steps.length}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {steps[step - 1]}
            <StepNavigation 
              currentStep={step} 
              totalSteps={steps.length} 
              setStep={setStep} 
              isLoading={isLoading} 
            />
          </form>
        </div>
      </div>
    </WavyBackground>
  )
}