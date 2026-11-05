import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onBack: () => void
  isLoading: boolean
  isValidating?: boolean
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isLoading,
  isValidating = false,
}: StepNavigationProps) {
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex items-center justify-between pt-2 border-t border-border/50">
      {currentStep > 1 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={15} />
          Back
        </Button>
      ) : (
        <div />
      )}

      {isLastStep ? (
        // Distinct keys matter: if React reused the Continue <button> and just
        // flipped its type to "submit", the click that advanced to this step
        // would also submit the form.
        <Button
          key="submit"
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
          key="next"
          type="button"
          onClick={onNext}
          disabled={isValidating}
          className="gap-1.5 px-6"
        >
          {isValidating ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Checking...
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={15} />
            </>
          )}
        </Button>
      )}
    </div>
  )
}
