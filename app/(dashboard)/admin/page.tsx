'use client'
import { useEffect, useState } from 'react'
import StatsCard from '@/components/dashboard/StatsCard'
import { StatSkeleton, TableSkeleton } from '@/components/ui/Skeleton'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'

interface AdminStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    status: string
    amount: number
    createdAt: string
    user: { name: string; email: string }
    service: { name: string }
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[AdminDashboard] Fetching stats...')
    const token = localStorage.getItem('access_token')
    const cacheBuster = Date.now()
    fetch(`/api/dashboard/stats?_=${cacheBuster}`, { 
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then((r) => r.json())
      .then((d) => {
        console.log('[AdminDashboard] API Response:', d)
        if (d.success) {
          console.log('[AdminDashboard] Setting stats:', d.data)
          setStats(d.data)
        } else {
          console.error('[AdminDashboard] API Error:', d.message)
        }
      })
      .catch((err) => console.error('[AdminDashboard] Fetch error:', err))
      .finally(() => {
        console.log('[AdminDashboard] Loading complete')
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
        <p className="text-white/50 text-sm mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatsCard title="Total Users" value={stats?.totalUsers || 0} icon="👥" color="purple" />
            <StatsCard title="Total Orders" value={stats?.totalOrders || 0} icon="📦" color="blue" />
            <StatsCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue || 0)} icon="💰" color="yellow" />
            <StatsCard title="Pending Orders" value={stats?.pendingOrders || 0} icon="⏳" color="green" />
          </>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Recent Orders</h3>
          <a href="/admin/orders" className="text-sm text-purple-400 hover:text-purple-300">View all →</a>
        </div>

        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-left text-xs text-white/40">
                  <th className="px-6 py-4 font-medium">Order #</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats?.recentOrders?.map((order) => (
                  <tr key={order.id} className="text-sm hover:bg-white/3">
                    <td className="px-6 py-4 text-purple-400 font-mono text-xs">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{order.user.name}</div>
                      <div className="text-white/40 text-xs">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-white/80">{order.service.name}</td>
                    <td className="px-6 py-4 text-white font-semibold">{formatCurrency(order.amount)}</td>
                    <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-white/40">{formatDate(order.createdAt)}</td>
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
