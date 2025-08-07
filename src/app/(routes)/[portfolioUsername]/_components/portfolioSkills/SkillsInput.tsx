import React from 'react'

interface SkillInputProps {
  newSkill: string
  setNewSkill: React.Dispatch<React.SetStateAction<string>>
  handleAddSkill: (e: React.FormEvent) => void
}

const SkillInput: React.FC<SkillInputProps> = ({ newSkill, setNewSkill, handleAddSkill }) => (
  <div className="flex items-center space-x-2">
    <input
      type="text"
      value={newSkill}
      onChange={(e) => setNewSkill(e.target.value)}
      placeholder="Add a new skill"
      className="flex-grow p-2 border border-gray-300 rounded-md"
    />
    <button
      type="button"
      onClick={handleAddSkill}
      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
    >
      Add
    </button>
  </div>
)

export default SkillInput
