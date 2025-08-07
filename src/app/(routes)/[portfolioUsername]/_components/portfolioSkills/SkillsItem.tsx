import React from 'react'

interface SkillItemProps {
  skill: string
  index: number
  handleRemoveSkill: (indexToRemove: number) => void
}

const SkillItem: React.FC<SkillItemProps> = ({ skill, index, handleRemoveSkill }) => (
  <div className="flex items-center justify-between p-2 dark:bg-black bg-white dark:text-white text-black dark:border-white border-black border rounded-md">
    <span>{skill}</span>
    <button
      type="button"
      onClick={() => handleRemoveSkill(index)}
      className="text-red-500 hover:text-red-700 text-xl"
    >
      &times;
    </button>
  </div>
)

export default SkillItem
