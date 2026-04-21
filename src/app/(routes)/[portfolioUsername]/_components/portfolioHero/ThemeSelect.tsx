import React from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ThemeSelectProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

const ThemeSelect: React.FC<ThemeSelectProps> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="theme" className="block text-sm font-medium mb-1">
      Theme
    </Label>
    <Select
      value={value}
      onValueChange={(val) =>
        onChange({ target: { value: val } } as React.ChangeEvent<HTMLSelectElement>)
      }
    >
      <SelectTrigger id="theme" className="w-full">
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="modern">Modern</SelectItem>
        <SelectItem value="creative">Creative</SelectItem>
        <SelectItem value="professional">Professional</SelectItem>
        <SelectItem value="bold">Bold</SelectItem>
      </SelectContent>
    </Select>
  </div>
)

export default ThemeSelect
