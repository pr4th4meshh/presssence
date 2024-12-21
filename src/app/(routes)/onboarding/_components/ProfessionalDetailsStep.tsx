import { UseFormRegister, FieldErrors, Control } from "react-hook-form"
import { FormData } from "@/lib/zod"
import { FaMagic } from "react-icons/fa"
import { CustomTagsInput } from "@/components/CustomTagsInput"

interface ProfessionalDetailsStepProps {
  register: UseFormRegister<FormData>
  errors: FieldErrors<FormData>
  control: Control<FormData>
  selectedFeatures: string[]
  setSelectedFeatures: React.Dispatch<React.SetStateAction<string[]>>
}

export default function ProfessionalDetailsStep({ register, errors, control, selectedFeatures, setSelectedFeatures }: ProfessionalDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="profession" className="block text-sm font-medium">What do you do?</label>
        <input
          id="profession"
          placeholder="Software Engineer"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register("profession")}
        />
        {errors.profession && <p className="text-sm text-red-500">{errors.profession.message}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="headline" className="block text-sm font-medium">Your headline</label>
        <div className="flex space-x-2">
          <textarea
            id="headline"
            placeholder="Building the future of web..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register("headline")}
          />
          <button
            type="button"
            className="px-3 py-2 border border-gray-300 rounded-md dark:bg-black bg-white hover:bg-gray-200 focus:outline-none"
            onClick={() => null}
            disabled
          >
            <FaMagic className="text-xl" />
          </button>
        </div>
        {errors.headline && <p className="text-sm text-red-500">{errors.headline.message}</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="features" className="block text-sm font-medium">Your Features</label>
        <CustomTagsInput
          tags={selectedFeatures}
          setTags={setSelectedFeatures}
          placeholder="Enter your skills"
        />
        {errors.features && <p className="text-sm text-red-500">{errors.features.message}</p>}
      </div>
    </div>
  )
}