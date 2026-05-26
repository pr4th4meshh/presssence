import React from "react"

const Loading = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-transparent dark:border-t-black border-t-black animate-spin" />
        <div className="absolute inset-1 rounded-full border-2 border-transparent dark:border-t-gray-400 border-t-gray-400 animate-spin animation-delay-150" style={{ animationDirection: "reverse" }} />
      </div>
      <p className="text-xs dark:text-gray-500 text-gray-400 font-medium animate-pulse">
        Loading portfolio...
      </p>
    </div>
  )
}

export default Loading
