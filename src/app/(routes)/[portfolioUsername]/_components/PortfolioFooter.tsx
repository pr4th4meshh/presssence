import Link from "next/link"
import React from "react"

const PortfolioFooter = () => {
  const currentYear = new Date().getFullYear()
  return (
    <>
    <div className="flex flex-row py-10 justify-center items-center">
      <h1>
        Created with {" "}
        <Link
          href="https://github.com/pr4th4meshh/presssence"
          className="underline underline-offset-2"
        >
          Presssence
        </Link>{" "}
        {currentYear}
      </h1>
    </div>
    </>
  )
}

export default PortfolioFooter
