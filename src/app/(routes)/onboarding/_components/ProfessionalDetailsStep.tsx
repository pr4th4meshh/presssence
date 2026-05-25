"use client"

import { UseFormRegister, FieldErrors, Control } from "react-hook-form"
import { FormData } from "@/lib/validations"
import { useState, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus, Briefcase, FileText, Sparkles } from "lucide-react"

interface ProfessionalDetailsStepProps {
  register: UseFormRegister<FormData>
  errors: FieldErrors<FormData>
  control: Control<FormData>
  selectedFeatures: string[]
  setSelectedFeatures: React.Dispatch<React.SetStateAction<string[]>>
}

const SUGGESTED_SKILLS = [
  "React", "TypeScript", "Node.js", "Python", "Figma",
  "Next.js", "UI/UX", "GraphQL", "AWS", "Docker",
]

export default function ProfessionalDetailsStep({ register, errors, selectedFeatures, setSelectedFeatures }: ProfessionalDetailsStepProps) {
  const [skillInput, setSkillInput] = useState("")

  const addSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !selectedFeatures.includes(trimmed)) {
      setSelectedFeatures([...selectedFeatures, trimmed])
    }
    setSkillInput("")
  }

  const removeSkill = (skill: string) => {
    setSelectedFeatures(selectedFeatures.filter((s) => s !== skill))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill(skillInput)
    } else if (e.key === "Backspace" && !skillInput && selectedFeatures.length > 0) {
      setSelectedFeatures(selectedFeatures.slice(0, -1))
    }
  }

  const unaddedSuggestions = SUGGESTED_SKILLS.filter((s) => !selectedFeatures.includes(s))

  return (
    <div className="space-y-5">
      {/* Profession */}
      <div className="space-y-2">
        <Label htmlFor="profession" className="text-sm font-medium flex items-center gap-1.5">
          <Briefcase size={14} />
          What do you do?
        </Label>
        <Input
          id="profession"
          placeholder="e.g. Full Stack Engineer, Product Designer..."
          autoFocus
          {...register("profession")}
        />
        {errors.profession && <p className="text-xs text-red-500">{errors.profession.message}</p>}
      </div>

      {/* Headline */}
      <div className="space-y-2">
        <Label htmlFor="headline" className="text-sm font-medium flex items-center gap-1.5">
          <FileText size={14} />
          Headline
          <span className="ml-auto text-xs text-muted-foreground font-normal">
            Short bio shown on your portfolio
          </span>
        </Label>
        <div className="relative">
          <Textarea
            id="headline"
            placeholder="Building impactful products at the intersection of design and code..."
            className="resize-none pr-10"
            rows={3}
            {...register("headline")}
          />
          <Sparkles size={14} className="absolute right-3 top-3 text-muted-foreground/50" />
        </div>
        {errors.headline && <p className="text-xs text-red-500">{errors.headline.message}</p>}
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <Sparkles size={14} />
          Skills & Technologies
          {selectedFeatures.length > 0 && (
            <span className="ml-auto text-xs font-normal px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
              {selectedFeatures.length} added
            </span>
          )}
        </Label>

        {/* Tags display + input */}
        <div className="min-h-[48px] flex flex-wrap gap-1.5 p-2.5 border rounded-lg bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-ring transition-shadow">
          {selectedFeatures.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-foreground text-background"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:opacity-70 transition-opacity ml-0.5"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedFeatures.length === 0 ? "Type a skill and press Enter..." : "Add more..."}
            className="flex-1 min-w-[120px] outline-none bg-transparent text-sm placeholder:text-muted-foreground"
          />
        </div>

        {/* Quick-add suggestions */}
        {unaddedSuggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-xs text-muted-foreground self-center">Quick add:</span>
            {unaddedSuggestions.slice(0, 6).map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-dashed border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                <Plus size={9} />
                {skill}
              </button>
            ))}
          </div>
        )}

        {errors.features && (
          <p className="text-xs text-red-500">{errors.features.message as string}</p>
        )}
      </div>
    </div>
  )
}
