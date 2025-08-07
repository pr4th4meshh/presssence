import React from "react"
import Image from "next/image"
import { FaClock } from "react-icons/fa"
import {
  Card,
  CardTitle,
  CardDescription,
  CardActions,
  ProjectLink,
} from "@/components/ui/projectsCard"
import ProjectThumbnail from "../../../../../public/project_thumbnail.jpg"

interface IProject {
  id?: string
  title: string
  description: string
  link: string
  timeline: string
  coverImage?: string
}

const ProjectCard = ({ project }: { project: IProject }) => {
  return (
    <Card>
      <Image
        src={project.coverImage || ProjectThumbnail}
        alt={project.title}
        width={200}
        height={200}
        className="border-2 border-background h-[250px] w-full object-cover"
        quality={100}
      />
      <CardTitle>{project.title}</CardTitle>
      <CardDescription>{project.description}</CardDescription>
      <CardDescription className="flex flex-row items-center">
        <FaClock className="mr-2" />
        {new Date(project.timeline).toDateString()}
      </CardDescription>
      <CardActions>
        <ProjectLink link={project.link} />
      </CardActions>
    </Card>
  )
}

export default ProjectCard
