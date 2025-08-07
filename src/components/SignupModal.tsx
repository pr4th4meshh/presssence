import React from 'react'
import { RxCross1 } from 'react-icons/rx'
import PrimaryButton from './ui/primary-button'
import { useRouter } from 'next/navigation'

const SignupModal = ({signUpPromptState}: any) => {
    const router = useRouter()
  return (
    <div
    className="fixed inset-0 backdrop-brightness-[30%] flex items-center justify-center z-50"
    onClick={() => signUpPromptState(false)}
  >
    <div className="bg-white dark:bg-black p-6 rounded-xl shadow-lg max-w-sm w-full border border-gray-700 shadow-gray-700">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Sign Up Required
        </h2>
        <RxCross1
          className="text-red-500 cursor-pointer text-xl"
          onClick={() => signUpPromptState(false)}
        />
      </div>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        You need to sign up or sign in before creating your portfolio.
      </p>
      <div className="flex justify-end space-x-2">
        <PrimaryButton
          title="Sign In"
          onClick={() => {
            signUpPromptState(false)
            router.push("/auth/login")
          }}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:border-white dark:text-white dark:bg-black"
        />
        <PrimaryButton
          title="Sign Up"
          onClick={() => {
            signUpPromptState(false)
            router.push("/auth/signup")
          }}
          className="px-4 py-2 dark:bg-white bg-black dark:text-black text-white rounded-md"
        />
      </div>
    </div>
  </div>
  )
}

export default SignupModal