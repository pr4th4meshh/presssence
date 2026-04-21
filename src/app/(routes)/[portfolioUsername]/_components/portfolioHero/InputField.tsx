import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InputFieldProps {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  type = "text",
}) => (
  <div>
    <Label htmlFor={id} className="block text-sm font-medium mb-1">
      {label}
    </Label>
    <Input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
    />
  </div>
)

export default InputField
