import React, { useEffect } from 'react'

interface ToastProps {
  message: string
  duration?: number
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className="fixed top-4 left-[45%] bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-50"
      role="alert"
      aria-live="assertive"
    >
      {message}
    </div>
  )
}

export default Toast