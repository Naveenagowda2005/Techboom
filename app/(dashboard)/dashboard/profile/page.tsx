'use client'
import { useEffect, useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  referralCode: string
  walletBalance: number
  isVerified: boolean
  createdAt: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setProfile(d.data)
          setForm({ name: d.data.name, phone: d.data.phone || '' })
        }
      })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const token = localStorage.getItem('access_token')
    const res = await fetch(`/api/users/${profile?.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.success) {
      setSuccess(true)
      // Update localStorage
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...stored, name: form.name }))
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  if (!profile) {
    return <div className="animate-pulse space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-white/10 rounded-xl" />)}</div>
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-white">Profile</h1>
        <p className="text-white/50 text-sm mt-1">Manage your account details</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-black text-2xl">
          {profile.name[0]}
        </div>
        <div>
          <div className="text-lg font-bold text-white">{profile.name}</div>
          <div className="text-sm text-white/50">{profile.email}</div>
          <div className="text-xs text-purple-400 mt-1">{profile.role}</div>
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="text-sm text-white/50 mb-1">Your Referral Code</div>
        <div className="text-xl font-black text-yellow-400 font-mono">{profile.referralCode}</div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Edit Profile</h3>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm">
            ✓ Profile updated successfully
          </div>
        )}

        <Input
          label="Full Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          label="Email Address"
          value={profile.email}
          disabled
          className="opacity-50 cursor-not-allowed"
        />
        <Input
          label="Phone Number"
          type="tel"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          placeholder="+91 98765 43210"
        />

        <Button type="submit" loading={saving}>Save Changes</Button>
      </form>
    </div>
  )
}
