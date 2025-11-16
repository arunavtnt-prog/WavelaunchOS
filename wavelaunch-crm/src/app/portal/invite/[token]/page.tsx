'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Loader2, AlertCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react'

interface InviteData {
  email: string
  clientName: string
  brandName: string
  expiresAt: string
}

export default function InviteRegistrationPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  // Validation state
  const [isValidating, setIsValidating] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [inviteData, setInviteData] = useState<InviteData | null>(null)

  // Form state
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordFeedback, setPasswordFeedback] = useState('')

  // Validate token on mount
  useEffect(() => {
    validateToken()
  }, [token])

  // Calculate password strength on change
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      setPasswordFeedback('')
      return
    }

    let strength = 0
    let feedback = ''

    // Length check
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 10

    // Character variety checks
    if (/[a-z]/.test(password)) strength += 15
    if (/[A-Z]/.test(password)) strength += 15
    if (/[0-9]/.test(password)) strength += 15
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20

    // Determine feedback
    if (strength < 40) {
      feedback = 'Weak password'
    } else if (strength < 70) {
      feedback = 'Fair password'
    } else if (strength < 90) {
      feedback = 'Good password'
    } else {
      feedback = 'Strong password'
    }

    setPasswordStrength(strength)
    setPasswordFeedback(feedback)
  }, [password])

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/portal/invite/validate?token=${token}`)
      const data = await response.json()

      if (data.success && data.valid) {
        setIsValidToken(true)
        setInviteData(data.data)
      } else {
        setIsValidToken(false)
        setValidationError(data.error || 'Invalid invite link')
      }
    } catch (err) {
      console.error('Token validation error:', err)
      setIsValidToken(false)
      setValidationError('Failed to validate invite link')
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordStrength < 40) {
      setError('Please choose a stronger password')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/portal/invite/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Registration failed. Please try again.')
        setIsSubmitting(false)
        return
      }

      // Success! Redirect to onboarding
      router.push(data.data.redirectTo || '/portal/onboarding')
      router.refresh()
    } catch (err) {
      console.error('Registration error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Validating your invite...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">Invalid Invite Link</CardTitle>
            <CardDescription>{validationError}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              This invite link may have expired or already been used. Please contact your Wavelaunch representative for a new invite.
            </p>
            <Button onClick={() => router.push('/portal/login')} variant="outline" className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Valid token - show registration form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Wavelaunch!</CardTitle>
          <CardDescription>
            Hi {inviteData?.clientName}! Let's set up your portal access for {inviteData?.brandName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={inviteData?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                This is the email you'll use to log in
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="new-password"
                minLength={8}
              />
              {password && (
                <div className="space-y-1">
                  <Progress value={passwordStrength} className="h-2" />
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium">
                      {passwordFeedback}
                    </p>
                    {passwordStrength >= 70 && (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use 8+ characters with uppercase, lowercase, numbers, and symbols
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              {confirmPassword && (
                <div className="flex items-center gap-1">
                  {password === confirmPassword ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <p className="text-xs text-green-600">Passwords match</p>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 text-destructive" />
                      <p className="text-xs text-destructive">Passwords do not match</p>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || passwordStrength < 40 || password !== confirmPassword}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating your account...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Activate My Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-blue-50 p-4 border border-blue-100">
            <p className="text-sm text-blue-900 font-medium mb-1">
              🎉 What happens next?
            </p>
            <p className="text-xs text-blue-700">
              After activating your account, you'll complete a quick onboarding to tell us about your business. Then we'll get started on your personalized business plan!
            </p>
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>
              This invite link expires on {new Date(inviteData?.expiresAt || '').toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
