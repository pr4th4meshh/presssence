import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React from "react"

interface SocialMediaInputProps {
  platform: string
  value: string
  handleInputChange: (platform: string, value: string) => void
}

const SocialMediaInput: React.FC<SocialMediaInputProps> = ({ platform, value, handleInputChange }) => (
  <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0">
    <Label htmlFor={platform} className="w-24 text-right capitalize">
      {platform}:
    </Label>
    <Input
      type="url"
      id={platform}
      value={value}
      onChange={(e) => handleInputChange(platform, e.target.value)}
      placeholder={`Enter ${platform} URL`}
      className="flex-grow p-2 rounded-md"
    />
  </div>
)

export default SocialMediaInput
