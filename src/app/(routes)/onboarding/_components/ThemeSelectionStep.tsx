import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { FormData } from "@/lib/zod"
import { FaPalette, FaChartBar, FaBook } from "react-icons/fa"

interface ThemeSelectionStepProps {
  register: UseFormRegister<FormData>
  watch: UseFormWatch<FormData>
  setValue: UseFormSetValue<FormData>
}

export default function ThemeSelectionStep({ register, watch, setValue }: ThemeSelectionStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="theme" className="block text-sm font-medium">Choose Your Theme</label>
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
        <button
          type="button"
          className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md dark:bg-black bg-white focus:outline-none"
          onClick={() => null}
          disabled
        >
          <FaPalette className="inline-block mr-2" />
          Generate AI Color Scheme
        </button>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Enable Features</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className={`w-full px-3 py-2 border ${
              watch("analyticsEnabled") ? "bg-blue-500 text-white" : "dark:bg-black dark:text-white text-black bg-white"
            } rounded-md`}
            onClick={() => setValue("analyticsEnabled", !watch("analyticsEnabled"))}
            disabled
          >
            <FaChartBar className="inline-block mr-2" />
            Analytics
          </button>
          <button
            type="button"
            className={`w-full px-3 py-2 border ${
              watch("blogEnabled") ? "bg-blue-600 text-white" : "dark:bg-black dark:text-white text-black bg-white"
            } rounded-md`}
            onClick={() => setValue("blogEnabled", !watch("blogEnabled"))}
            disabled
          >
            <FaBook className="inline-block mr-2" />
            Blog
          </button>
        </div>
      </div>
    </div>
  )
}