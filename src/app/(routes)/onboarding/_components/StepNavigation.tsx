import { FaChevronRight } from "react-icons/fa"
import { BiLeftArrowAlt } from "react-icons/bi"
import PrimaryButton from "@/components/ui/primary-button"

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

  return (
    <div className="flex justify-between items-center">
      {currentStep > 1 && (
        <button
          className="flex items-center underline underline-offset-2"
          onClick={handlePrevious}
        >
          <BiLeftArrowAlt className="mr-1" />
          Go back
        </button>
      )}
      {currentStep === totalSteps ? (
        <PrimaryButton
          title={isLoading ? "Creating Profile..." : "Create Profile"}
          type="submit"
          disabled={isLoading}
        />
      ) : (
        <PrimaryButton
          title="Next Step"
          onClick={handleNext}
          icon={<FaChevronRight className="mr-1" />}
        />
      )}
    </div>
  )
}