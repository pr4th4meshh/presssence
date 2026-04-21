"use client"

import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const SignupModal = ({ signUpPromptState }: { signUpPromptState: (val: boolean) => void }) => {
  const router = useRouter()

  return (
    <Dialog open onOpenChange={() => signUpPromptState(false)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Sign Up Required</DialogTitle>
          <DialogDescription>
            You need to sign up or sign in before creating your portfolio.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              signUpPromptState(false)
              router.push("/auth/login")
            }}
          >
            Sign In
          </Button>
          <Button
            onClick={() => {
              signUpPromptState(false)
              router.push("/auth/signup")
            }}
          >
            Sign Up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SignupModal
