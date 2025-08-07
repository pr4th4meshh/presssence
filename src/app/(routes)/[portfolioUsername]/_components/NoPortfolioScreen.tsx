import PrimaryButton from "@/components/ui/primary-button"
import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"
import { motion } from "framer-motion"
import GalaxyBackground from "./StarsBackground"
import { WavyBackground } from "@/components/ui/wavy-background"

const NoPortfolioScreen = () => {
  const params = useParams()

  const containerVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  const headingVariants = {
    hidden: { y: -30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 20, delay: 0.8 },
    },
  }

  const textAvailableVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 50, delay: 1.2 },
    },
  }

  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, delay: 0.5},
    },
  }

  const hoverButtonVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    },
  }

  return (
    <WavyBackground>
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center  relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      <motion.h1
        className="text-3xl sm:text-5xl text-center font-bold"
        variants={headingVariants}
      >
        presssence.me/{params.portfolioUsername} is{" "}
        <motion.span
          className="text-white bg-green-600 italic p-2 sm:p-3 sm:mt-0 mt-2 rounded-lg inline-block"
          variants={textAvailableVariants}
        >
          available !!
        </motion.span>
      </motion.h1>

      <motion.div variants={buttonVariants && hoverButtonVariants} whileHover="hover">
        <Link href="/">
          <PrimaryButton title="Click here and claim now !!" className="mt-6" />
        </Link>
      </motion.div>
    </motion.div>
    </WavyBackground>
  )
}

export default NoPortfolioScreen