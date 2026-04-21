import { Button } from '@/components/ui/button'
import React from 'react'

interface SkillItemProps {
  skill: string
  index: number
  handleRemoveSkill: (indexToRemove: number) => void
}

const SkillItem: React.FC<SkillItemProps> = ({ skill, index, handleRemoveSkill }) => (
  <div className="flex items-center justify-between p-2 bg-card text-card-foreground border border-border rounded-md">
    <span>{skill}</span>
    <Button
      type="button"
      onClick={() => handleRemoveSkill(index)}
      className="text-red-500 hover:text-red-700 text-xl"
    >
      &times;
    </Button>
  </div>
)

export default SkillItem
