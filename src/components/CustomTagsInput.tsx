import React, { useState, KeyboardEvent, ChangeEvent } from 'react'
import { FaTimes } from 'react-icons/fa'
import { Button } from './ui/button'

interface CustomTagsInputProps {
  tags: string[]
  setTags: React.Dispatch<React.SetStateAction<string[]>>
  placeholder?: string
}

export const CustomTagsInput: React.FC<CustomTagsInputProps> = ({ tags, setTags, placeholder = "Add tags..." }) => {
  const [input, setInput] = useState('')

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input) {
      e.preventDefault()
      if (!tags.includes(input.trim())) {
        setTags([...tags, input.trim()])
      }
      setInput('')
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="flex flex-wrap items-center p-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
      {tags.map((tag, index) => (
        <div key={index} className="flex items-center bg-black text-white dark:bg-white dark:text-black rounded-full px-2 py-1 m-1">
          <span className="mr-1">{tag}</span>
          <Button type="button" onClick={() => removeTag(tag)} className="focus:outline-none">
            <FaTimes className="dark:text-black text-white" />
          </Button>
        </div>
      ))}
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        className="flex-grow outline-none bg-transparent p-1"
      />
    </div>
  )
}