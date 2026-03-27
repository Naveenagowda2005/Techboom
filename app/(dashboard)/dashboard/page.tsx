'use client'
import { useEffect, useState } from 'react'
import StatsCard from '@/components/dashboard/StatsCard'
import { StatSkeleton, TableSkeleton } from '@/components/ui/Skeleton'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface DashboardStats {
  totalOrders: number
  totalEarnings: number
  pendingCommissions: number
  walletBalance: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    status: string
    amount: number
    createdAt: string
    service: { name: string; category: string }
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ referralCode: string; name: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))

    const token = localStorage.getItem('access_token')
    fetch('/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data) })
      .finally(() => setLoading(false))
  }, [])

  const referralLink = user
    ? `${window.location.origin}/signup?ref=${user.referralCode}`
    : ''

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-white/50 text-sm mt-1">Welcome back! Here&apos;s your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatsCard title="Total Orders" value={stats?.totalOrders || 0} icon="📦" color="purple" />
            <StatsCard title="Total Earnings" value={formatCurrency(stats?.totalEarnings || 0)} icon="💰" color="yellow" />
            <StatsCard title="Wallet Balance" value={formatCurrency(stats?.walletBalance || 0)} icon="💳" color="green" />
            <StatsCard title="Pending Commissions" value={stats?.pendingCommissions || 0} icon="⏳" color="blue" />
          </>
        )}
      </div>

      {/* Referral Link */}
      {user && (
        <div className="bg-gradient-to-r from-purple-900/40 to-yellow-900/10 border border-purple-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2">Your Referral Link</h3>
          <p className="text-white/50 text-sm mb-4">Share this link and earn 10% commission on every order.</p>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 truncate">
              {referralLink}
            </div>
            <button
              onClick={copyReferralLink}
              className="btn-primary text-sm px-5 py-3 whitespace-nowrap"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Recent Orders</h3>
          <Link href="/dashboard/orders" className="text-sm text-purple-400 hover:text-purple-300">
            View all →
          </Link>
        </div>

        {loading ? (
          <TableSkeleton rows={4} />
        ) : stats?.recentOrders?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-white/50">No orders yet</p>
            <Link href="/dashboard/services" className="btn-primary text-sm mt-4 inline-flex">
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-white/40 border-b border-white/10">
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Service</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats?.recentOrders?.map((order) => (
                  <tr key={order.id} className="text-sm">
                    <td className="py-3 text-purple-400 font-mono text-xs">{order.orderNumber}</td>
                    <td className="py-3 text-white/80">{order.service.name}</td>
                    <td className="py-3 text-white font-medium">{formatCurrency(order.amount)}</td>
                    <td className="py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="py-3 text-white/40">{formatDate(order.createdAt)}</td>
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
