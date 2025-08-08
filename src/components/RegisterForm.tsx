'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// import { button } from '@/components/ui/button'
// import { input } from '@/components/ui/input'
// import { label } from '@/components/ui/label'
import { registerUser } from '@/actions/registerUser'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Input } from './ui/input'

export default function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const result = await registerUser(name, email, password)

    if (result.error) {
      setError(result.error)
    } else {
      router.push('/')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">Name</label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit" className="w-full">Register</Button>
    </form>
  )
}

