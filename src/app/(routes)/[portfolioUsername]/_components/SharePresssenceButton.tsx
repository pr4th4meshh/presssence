import React from "react"

const SharePresssenceButton = () => {
  const copyToClipboard = () => {
    const textArea = document.createElement("textarea")
    textArea.value = window.location.href
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand("copy")
    textArea.remove()
  }
  return (
    <div
      onClick={copyToClipboard}
      className="absolute sm:fixed transform -rotate-90  bg-green-600 text-white origin-top-left top-[350px] z-50 left-0 py-1 px-2 sm:px-4 rounded-b-lg sm:py-1 text-sm sm:text-lg tracking-wide border-t-0 cursor-pointer"
    >
      Share your Presssence
    </div>
  )
}

export default SharePresssenceButton
