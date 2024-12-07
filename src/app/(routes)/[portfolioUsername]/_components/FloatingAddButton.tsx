"use client"

import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { FaPlus, FaTimes} from "react-icons/fa"

type AddItemType = "social" | "feature" | "project"

interface FloatingAddButtonProps {
  userId: string
  socialMediaLinks: Record<string, string> | undefined
  features: string[] | undefined
  projects: any[] | undefined
  onUpdate: (type: AddItemType, newData: any) => void
}

const FloatingAddButton = ({ socialMediaLinks, features, projects, onUpdate, userId }: FloatingAddButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [addType, setAddType] = useState<AddItemType | null>(null)
  const [newItem, setNewItem] = useState("")
  const [newSocialLink, setNewSocialLink] = useState("")
  const [newProject, setNewProject] = useState({ title: "", description: "", link: "", timeline: "" })
  const params = useParams()

  console.log(features)

  const handleAdd = async () => {
    if (!addType) return

    try {
      let updatedData
      if (addType === "social") {
        updatedData = { ...socialMediaLinks, [newItem]: newSocialLink }
      } else if (addType === "feature") {
        updatedData = [...(features || []), newItem]
      } else if (addType === "project") {
        updatedData = [...(projects || []), newProject]
      }

      const response = await fetch(`/api/portfolio?portfolioUsername=${params.portfolioUsername}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [addType === "social" ? "socialLinks" : addType === "feature" ? "features" : "projects"]: updatedData }),
      })

      if (response.ok) {
        onUpdate(addType, updatedData)
        setIsOpen(false)
        setNewItem("")
        setNewSocialLink("")
        setNewProject({ title: "", description: "", link: "", timeline: "" })
        alert(`New ${addType} added successfully.`)
      } else {
        throw new Error("Failed to update")
      }
    } catch (error) {
      console.error(`Error adding ${addType}:`, error)
      alert(`Failed to add new ${addType}.`)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-64">
          {!addType ? (
            <div className="space-y-2">
              <button
                onClick={() => setAddType("social")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Add Social Media
              </button>
              <button
                onClick={() => setAddType("feature")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Add Feature
              </button>
              <button
                onClick={() => setAddType("project")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Add Project
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }} className="space-y-4">
              {addType === "social" && (
                <>
                  <div>
                    <label htmlFor="platform" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Social Media Platform
                    </label>
                    <select
                      id="platform"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select a platform</option>
                      <option value="twitter">Twitter</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="github">GitHub</option>
                      <option value="website">Website</option>
                      <option value="behance">Behance</option>
                      <option value="figma">Figma</option>
                      <option value="awwwards">Awwwards</option>
                      <option value="dribbble">Dribbble</option>
                      <option value="medium">Medium</option>
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="socialLink" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Social Media Link
                    </label>
                    <input
                      type="url"
                      id="socialLink"
                      value={newSocialLink}
                      onChange={(e) => setNewSocialLink(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter social media link"
                    />
                  </div>
                </>
              )}
              {addType === "feature" && (
                <div>
                  <label htmlFor="feature" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    New Feature
                  </label>
                  <input
                    type="text"
                    id="feature"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter a new feature or skill"
                  />
                </div>
              )}
              {addType === "project" && (
                <>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Project Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter project title"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Project Description
                    </label>
                    <textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Project Link
                    </label>
                    <input
                      type="url"
                      id="link"
                      value={newProject.link}
                      onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter project link"
                    />
                  </div>
                  <div>
                    <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Project Timeline
                    </label>
                    <input
                      type="date"
                      id="timeline"
                      value={newProject.timeline}
                      onChange={(e) => setNewProject({ ...newProject, timeline: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAddType(null)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaTimes className="mr-2 h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Add {addType}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {isOpen ? <h1>Close</h1> : <h1>Add Item</h1>}
      </button>
    </div>
  )
}

export default FloatingAddButton;   