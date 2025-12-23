"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Login attempt - Email:', email)
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('Login result:', result)

      if (result?.error) {
        console.error('Login error:', result.error)
        setError('Invalid email or password')
      } else if (result?.ok) {
        console.log('Login successful, redirecting to dashboard')
        window.location.href = '/dashboard'
      } else {
        console.error('Unknown login result:', result)
        setError('An unexpected error occurred')
      }
    } catch (error) {
      console.error('Login exception:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-start gap-1 text-left mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#f97316] shrink-0" />
            <h1
              className="font-bold"
              style={{
                fontFamily: "HelveticaNeue-Medium, Helvetica Neue, Helvetica, Arial, sans-serif",
                fontWeight: 400,
                fontSize: "32px",
              }}
            >
              WavelaunchOS
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">Access your workspace</p>
          <div className="h-px w-full bg-foreground opacity-30 mt-4" />
        </div>
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="admin@wavelaunch.studio"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </Field>
        <Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Field>
        <FieldSeparator>Or go back to</FieldSeparator>
        <Field>
          <Button variant="outline" type="button" className="w-full">
            Wavelaunch Studio
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a href="#" className="underline underline-offset-4">
              Sign up
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
