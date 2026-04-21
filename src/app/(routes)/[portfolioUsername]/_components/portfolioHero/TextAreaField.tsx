import React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface TextAreaFieldProps {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  id,
  label,
  value,
  onChange,
}) => (
  <div>
    <Label htmlFor={id} className="block text-sm font-medium mb-1">
      {label}
    </Label>
    <Textarea
      id={id}
      value={value}
      onChange={onChange}
      rows={3}
      className="resize-none"
    />
  </div>
)

export default TextAreaField
