import React from "react"

interface ThemeSelectProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

const ThemeSelect: React.FC<ThemeSelectProps> = ({ value, onChange }) => (
  <div>
    <label
      htmlFor="theme"
      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      Theme
    </label>
    <select
      id="theme"
      value={value}
      onChange={onChange}
      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary"
    >
      <option value="modern">Modern</option>
      <option value="creative">Creative</option>
      <option value="professional">Professional</option>
      <option value="bold">Bold</option>
    </select>
  </div>
)

export default ThemeSelect
