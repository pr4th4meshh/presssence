import React, { useState } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import PrimaryButton from "@/components/ui/primary-button"
import EditButton from "./EditButton"
import SkillInput from "./portfolioSkills/SkillsInput"
import SkillItem from "./portfolioSkills/SkillsItem"

const PortfolioSkills = ({ skillsAndFeatures }: any) => {
  const [isEditing, setIsEditing] = useState(false)
  const [skills, setSkills] = useState(skillsAndFeatures?.features)
  const [newSkill, setNewSkill] = useState("")
  const { data: session } = useSession()
  const params = useParams()
  
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (indexToRemove: number) => {
    setSkills(skills.filter((_: string, index: number) => index !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(
        `/api/portfolio?portfolioUsername=${params.portfolioUsername}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ features: skills }),
        }
      )

      if (response.ok) {
        setIsEditing(false)
      } else {
        const data = await response.json()
        alert(data.message || "Failed to update skills")
      }
    } catch (error) {
      console.error("Error updating skills:", error)
      alert("An error occurred while updating the skills")
    }
  }

  return (
    skills.length > 0 && (
      <div className="container mx-auto px-4 py-20">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <SkillInput newSkill={newSkill} setNewSkill={setNewSkill} handleAddSkill={handleAddSkill} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {skills.map((skill: string, index: number) => (

              <SkillItem key={index} skill={skill} index={index} handleRemoveSkill={handleRemoveSkill} />
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <PrimaryButton
              title="Cancel"
              onClick={() => setIsEditing(false)}
              className="bg-red-500 text-white hover:bg-red-600"
            />
            <PrimaryButton title="Save Changes" type="submit" />
          </div>
        </form>
      ) : (
        <div className="">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-7">
            {skills.map((skill: string, index: number) => (
              <div key={index} className="text-center">
                <div className="dark:text-white border border-gray-500 text-black p-2 relative rounded-2xl mx-5">
                  {skill}
                </div>
              </div>
            ))}
          </div>
          {session?.user?.id === skillsAndFeatures?.userId && (
            <EditButton
              className="mt-2 mr-2 float-right"
              onClick={() => setIsEditing(true)}
            />
          )}
        </div>
      )}
    </div>
    )
  )
}

export default PortfolioSkills