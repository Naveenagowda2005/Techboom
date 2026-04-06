'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Suspense } from 'react'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') || ''

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    referralCode: refCode,
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setApiError('')
    setErrors({})

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) setErrors(data.errors)
        else setApiError(data.message || 'Registration failed')
        return
      }

      localStorage.setItem('access_token', data.data.accessToken)
      localStorage.setItem('user', JSON.stringify(data.data.user))
      // Use window.location for a full page reload to ensure cookies are set
      window.location.href = '/dashboard'
    } catch {
      setApiError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-yellow-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-yellow-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">TB</span>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
              Techboom
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-2">Create your account</h1>
          <p className="text-white/50 text-sm">Start booking services today</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
              {apiError}
            </div>
          )}

          {refCode && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-6 text-green-400 text-sm">
              🎉 You were referred! You&apos;ll get special benefits.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name?.[0]}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email?.[0]}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password?.[0]}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={errors.phone?.[0]}
              required
            />
            <Input
              label="Referral Code (optional)"
              placeholder="Enter referral code"
              value={form.referralCode}
              onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
              error={errors.referralCode?.[0]}
            />

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs text-white/40 mt-4">
            By signing up, you agree to our{' '}
            <Link href="#" className="text-purple-400">Terms</Link> and{' '}
            <Link href="#" className="text-purple-400">Privacy Policy</Link>
          </p>

          <p className="text-center text-sm text-white/50 mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign in
            </Link>
          </p>

          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-white/40">
              Want to become a referrer?{' '}
              <Link href="/user/signup" className="text-purple-400 hover:text-purple-300">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" /></div>}>
      <SignupForm />
    </Suspense>
  )
}
