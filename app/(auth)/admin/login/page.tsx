'use client'
import { useState } from 'react'
import Link from 'next/link'
import Input from '../../../../components/ui/Input'
import Button from '../../../../components/ui/Button'

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setApiError('')
    setErrors({})

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) setErrors(data.errors)
        else setApiError(data.message || 'Login failed')
        return
      }

      // Check if user has ADMIN role
      if (data.data?.user?.role !== 'ADMIN') {
        setApiError('Access denied. Admin credentials required.')
        // Clear any existing non-admin session
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        return
      }

      // Store token in localStorage for client-side use
      if (data.data?.accessToken) {
        localStorage.setItem('access_token', data.data.accessToken)
        localStorage.setItem('user', JSON.stringify(data.data.user))
      }
      
      // Redirect to admin dashboard
      window.location.href = '/admin'
    } catch {
      setApiError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-[#0f0a1e] via-[#1a0f2e] to-[#0f0a1e]">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg">TB</span>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
              Techboom
            </span>
          </Link>
          <div className="mt-6 mb-2 flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <span className="text-red-400 text-lg">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          </div>
          <p className="text-white/50 text-sm">Secure access for administrators only</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 border border-red-500/20 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Admin Email"
              type="email"
              placeholder="Enter your admin email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email?.[0]}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password?.[0]}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              <Link href="#" className="text-sm text-red-400 hover:text-red-300">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700" size="lg">
              🔐 Sign In as Admin
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
              <p className="text-yellow-400 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>This portal is for authorized administrators only. Unauthorized access attempts are logged and monitored.</span>
              </p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-white/40">
              Not an admin?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300">
                Customer Login
              </Link>
              {' | '}
              <Link href="/user/login" className="text-purple-400 hover:text-purple-300">
                Referrer Login
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/30">
            🔒 Secured with end-to-end encryption
          </p>
        </div>
      </div>
    </div>
  )
}
