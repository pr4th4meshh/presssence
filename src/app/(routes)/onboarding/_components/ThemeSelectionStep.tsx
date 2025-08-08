import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { FormData } from "@/lib/zod"
import { FaPalette, FaChartBar, FaBook } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface ThemeSelectionStepProps {
  register: UseFormRegister<FormData>
  watch: UseFormWatch<FormData>
  setValue: UseFormSetValue<FormData>
}

export default function ThemeSelectionStep({ register, watch, setValue }: ThemeSelectionStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="theme" className="block text-sm font-medium">Choose Your Theme</Label>
        <select
          id="theme"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register("theme")}
          disabled
        >
          <option value="modern">Modern Minimal</option>
          <option value="creative">Creative</option>
          <option value="professional">Professional</option>
          <option value="bold">Bold & Dynamic</option>
        </select>
        <Button
          type="button"
          className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md dark:bg-black bg-white focus:outline-none"
          onClick={() => null}
          disabled
        >
          <FaPalette className="inline-block mr-2" />
          Generate AI Color Scheme
        </Button>
      </div>
      <div className="space-y-2">
        <Label className="block text-sm font-medium">Enable Features</Label>
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            className={`w-full px-3 py-2 border ${
              watch("analyticsEnabled") ? "bg-blue-500 text-white" : "dark:bg-black dark:text-white text-black bg-white"
            } rounded-md`}
            onClick={() => setValue("analyticsEnabled", !watch("analyticsEnabled"))}
            disabled
          >
            <FaChartBar className="inline-block mr-2" />
            Analytics
          </Button>
          <Button
            type="button"
            className={`w-full px-3 py-2 border ${
              watch("blogEnabled") ? "bg-blue-600 text-white" : "dark:bg-black dark:text-white text-black bg-white"
            } rounded-md`}
            onClick={() => setValue("blogEnabled", !watch("blogEnabled"))}
            disabled
          >
            <FaBook className="inline-block mr-2" />
            Blog
          </Button>
        </div>
      </div>
    </div>
  )
}