'use client'
import { useEffect, useState } from 'react'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import StatsCard from '@/components/dashboard/StatsCard'

interface Referral {
  id: string
  referralCode: string
  commissionAmount: number
  isPaid: boolean
  createdAt: string
  order?: { orderNumber: string; amount: number; status: string; service: { name: string } }
}

export default function ReferralsPage() {
  const [data, setData] = useState<{ referrals: Referral[]; stats: { totalReferrals: number; totalEarnings: number } } | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ referralCode: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))

    const token = localStorage.getItem('access_token')
    fetch('/api/referrals', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const referralLink = user ? `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${user.referralCode}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Referrals & Earnings</h1>
        <p className="text-white/50 text-sm mt-1">Track your referrals and commissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatsCard title="Total Referrals" value={data?.stats.totalReferrals || 0} icon="🔗" color="purple" />
        <StatsCard title="Total Earnings" value={formatCurrency(data?.stats.totalEarnings || 0)} icon="💰" color="yellow" />
      </div>

      {/* Referral Link */}
      <div className="bg-gradient-to-r from-purple-900/40 to-yellow-900/10 border border-purple-500/30 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-1">Your Referral Link</h3>
        <p className="text-white/50 text-sm mb-4">Earn 10% commission on every order placed via your link.</p>
        <div className="flex gap-3">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 truncate font-mono">
            {referralLink}
          </div>
          <button onClick={copyLink} className="btn-primary text-sm px-5 whitespace-nowrap">
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Referral History</h3>
        </div>

        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} /></div>
        ) : !data?.referrals?.length ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔗</div>
            <p className="text-white/50">No referrals yet. Share your link to start earning!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-left text-xs text-white/40">
                  <th className="px-6 py-4 font-medium">Order</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Order Amount</th>
                  <th className="px-6 py-4 font-medium">Commission</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.referrals.map((ref) => (
                  <tr key={ref.id} className="text-sm">
                    <td className="px-6 py-4 text-purple-400 font-mono text-xs">{ref.order?.orderNumber || '—'}</td>
                    <td className="px-6 py-4 text-white/80">{ref.order?.service.name || '—'}</td>
                    <td className="px-6 py-4 text-white">{ref.order ? formatCurrency(ref.order.amount) : '—'}</td>
                    <td className="px-6 py-4 text-green-400 font-semibold">{formatCurrency(ref.commissionAmount || 0)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${ref.isPaid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {ref.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/40">{formatDate(ref.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
