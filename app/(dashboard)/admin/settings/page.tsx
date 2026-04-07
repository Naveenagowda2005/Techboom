'use client'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Settings {
  id: string
  referralDiscountPercent: number
  referralCommissionPercent: number
  updatedAt: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    referralDiscountPercent: 20,
    referralCommissionPercent: 10
  })

  const fetchSettings = async () => {
    setLoading(true)
    const token = localStorage.getItem('access_token')
    try {
      const res = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setSettings(data.data)
        setFormData({
          referralDiscountPercent: data.data.referralDiscountPercent,
          referralCommissionPercent: data.data.referralCommissionPercent
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const token = localStorage.getItem('access_token')
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        alert('Settings updated successfully!')
        fetchSettings()
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-white/50 text-sm mt-1">Manage referral program settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Settings Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎁</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Referral Program</h2>
              <p className="text-white/50 text-sm">Configure referral rewards</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="New Customer Discount (%)"
                type="number"
                min="0"
                max="100"
                value={formData.referralDiscountPercent}
                onChange={(e) => setFormData({
                  ...formData,
                  referralDiscountPercent: parseInt(e.target.value) || 0
                })}
                required
              />
              <p className="text-xs text-white/40 mt-1">
                Discount percentage for referred customers on their first order
              </p>
            </div>

            <div>
              <Input
                label="Referrer Commission (%)"
                type="number"
                min="0"
                max="100"
                value={formData.referralCommissionPercent}
                onChange={(e) => setFormData({
                  ...formData,
                  referralCommissionPercent: parseInt(e.target.value) || 0
                })}
                required
              />
              <p className="text-xs text-white/40 mt-1">
                Commission percentage for referrers on referred orders
              </p>
            </div>

            <Button type="submit" loading={saving} className="w-full">
              Save Settings
            </Button>
          </form>
        </div>

        {/* Preview Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👁️</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Preview</h2>
              <p className="text-white/50 text-sm">How it will look to users</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Customer Preview */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-green-400 font-medium text-sm">New Customer Benefit</p>
                  <p className="text-white/70 text-xs mt-1">
                    Get {formData.referralDiscountPercent}% off your first order!
                  </p>
                </div>
              </div>
            </div>

            {/* Referrer Preview */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="text-purple-400 font-medium text-sm">Referrer Benefit</p>
                  <p className="text-white/70 text-xs mt-1">
                    Earn {formData.referralCommissionPercent}% commission on every referred order
                  </p>
                </div>
              </div>
            </div>

            {/* Example Calculation */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white/50 text-xs font-medium mb-2">Example Calculation:</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Order Amount:</span>
                  <span>₹10,000</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Customer Discount ({formData.referralDiscountPercent}%):</span>
                  <span>-₹{(10000 * formData.referralDiscountPercent / 100).toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>Referrer Commission ({formData.referralCommissionPercent}%):</span>
                  <span>+₹{(10000 * formData.referralCommissionPercent / 100).toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-white font-medium pt-2 border-t border-white/10">
                  <span>Customer Pays:</span>
                  <span>₹{(10000 - (10000 * formData.referralDiscountPercent / 100)).toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {settings && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40">
            Last updated: {new Date(settings.updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}
