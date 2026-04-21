import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  setStep: (step: number) => void
  isLoading: boolean
}

export default function StepNavigation({ currentStep, totalSteps, setStep, isLoading }: StepNavigationProps) {
  const handleNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setStep(currentStep + 1)
  }

  const handlePrevious = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setStep(currentStep - 1)
  }

  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex items-center justify-between pt-2 border-t border-border/50">
      {currentStep > 1 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={15} />
          Back
        </Button>
      ) : (
        <div />
      )}

      {isLastStep ? (
        <Button
          type="submit"
          disabled={isLoading}
          className="gap-2 px-6"
        >
          {isLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Creating profile...
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Create my portfolio
            </>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleNext}
          className="gap-1.5 px-6"
        >
          Continue
          <ArrowRight size={15} />
        </Button>
      )}
    </div>
  )
}
