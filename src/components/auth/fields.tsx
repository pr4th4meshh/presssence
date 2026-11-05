"use client"

import { forwardRef, useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"
import { cn } from "@/lib/utils"

const inputClass =
  "h-11 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 transition-colors outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10 aria-[invalid=true]:border-red-500"

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  /** Shown under the input when there's no error. */
  hint?: string
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, hint, id, className, ...props },
  ref
) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-900">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(inputClass, className)}
        {...props}
      />
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  )
})

interface PasswordFieldProps extends Omit<FieldProps, "type"> {
  /** Shown at the end of the label row, e.g. a "Forgot password?" link. */
  labelAction?: React.ReactNode
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ label, error, hint, id, labelAction, ...props }, ref) {
    const [visible, setVisible] = useState(false)
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
    return (
      <div className="relative">
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-900">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(inputClass, "pr-11")}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-neutral-400 transition-colors hover:text-neutral-900 focus-visible:text-neutral-900 focus-visible:outline-none"
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        <FieldMessage id={id} error={error} hint={hint} />
        {/* Drawn in the label row but placed after the input in the DOM, so Tab
            goes from the email straight to the password. */}
        {labelAction && <div className="absolute right-0 top-0 leading-5">{labelAction}</div>}
      </div>
    )
  }
)

function FieldMessage({ id, error, hint }: { id?: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">
        {error}
      </p>
    )
  }
  if (hint) {
    return (
      <p id={`${id}-hint`} className="mt-1.5 text-sm text-neutral-500">
        {hint}
      </p>
    )
  }
  return null
}

export function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-neutral-900 text-[15px] font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function GoogleButton({ callbackUrl }: { callbackUrl: string }) {
  const [pending, setPending] = useState(false)
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        setPending(true)
        signIn("google", { callbackUrl })
      }}
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-neutral-200 bg-white text-[15px] font-medium text-neutral-900 transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f5] disabled:opacity-60"
    >
      {pending ? (
        <Loader2 size={16} className="animate-spin" aria-hidden />
      ) : (
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
        </svg>
      )}
      Continue with Google
    </button>
  )
}

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-3 text-sm text-neutral-400">
      <span className="h-px flex-1 bg-neutral-200" />
      or
      <span className="h-px flex-1 bg-neutral-200" />
    </div>
  )
}

export function FormError({ message }: { message: string }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {message}
    </p>
  )
}
