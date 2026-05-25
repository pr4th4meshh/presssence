import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form"
import { FormData } from "@/lib/validations"
import { FaPalette, FaChartBar, FaBook } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ThemeSelectionStepProps {
  register: UseFormRegister<FormData>
  watch: UseFormWatch<FormData>
  setValue: UseFormSetValue<FormData>
}

export default function ThemeSelectionStep({ watch, setValue }: ThemeSelectionStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="theme" className="block text-sm font-medium">Choose Your Theme</Label>
        <Select
          value={watch("theme")}
          onValueChange={(value) => setValue("theme", value as "modern" | "bold" | "creative" | "professional")}
        >
          <SelectTrigger id="theme" className="w-full">
            <SelectValue placeholder="Select a theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="modern">Modern Minimal</SelectItem>
            <SelectItem value="creative">Creative</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="bold">Bold & Dynamic</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none"
          onClick={() => null}
          disabled
          hidden
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
            className={`w-full px-3 py-2 border border-border rounded-md ${
              watch("analyticsEnabled") ? "bg-blue-500 text-white" : "bg-background text-foreground"
            }`}
            onClick={() => setValue("analyticsEnabled", !watch("analyticsEnabled"))}
            disabled
          >
            <FaChartBar className="inline-block mr-2" />
            Analytics
          </Button>
          <Button
            type="button"
            className={`w-full px-3 py-2 border border-border rounded-md ${
              watch("blogEnabled") ? "bg-blue-600 text-white" : "bg-background text-foreground"
            }`}
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
