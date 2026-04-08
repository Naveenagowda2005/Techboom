'use client'
import { useEffect, useState } from 'react'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Referral {
  id: string
  referralCode: string
  commissionRate: number
  commissionAmount: number | null
  isPaid: boolean
  createdAt: string
  referrer: {
    name: string
    email: string
  }
  referredUser: {
    name: string
    email: string
  }
  order: {
    orderNumber: string
    amount: number
    status: string
  } | null
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    totalCommission: 0
  })

  const fetchReferrals = async () => {
    setLoading(true)
    const token = localStorage.getItem('access_token')
    try {
      const res = await fetch('/api/referrals', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      console.log('Admin referrals API response:', data)
      
      if (data.success) {
        const referralsList = data.data.referrals || []
        console.log('Referrals list:', referralsList)
        setReferrals(referralsList)
        
        // Calculate stats
        const total = referralsList.length
        const paid = referralsList.filter((r: Referral) => r.isPaid).length
        const pending = total - paid
        const totalCommission = referralsList.reduce(
          (sum: number, r: Referral) => sum + (Number(r.commissionAmount) || 0),
          0
        )
        
        setStats({ total, paid, pending, totalCommission })
      } else {
        console.error('API returned error:', data)
      }
    } catch (error) {
      console.error('Error fetching referrals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReferrals()
  }, [])

  const markAsPaid = async (id: string) => {
    if (!confirm('Mark this commission as paid?')) return

    const token = localStorage.getItem('access_token')
    try {
      const res = await fetch(`/api/referrals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPaid: true })
      })

      if (res.ok) {
        fetchReferrals()
      }
    } catch (error) {
      console.error('Error updating referral:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Referrals</h1>
        <p className="text-white/50 text-sm mt-1">Manage referral program and commissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-white/50 text-xs mb-1">Total Referrals</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-white/50 text-xs mb-1">Paid</div>
          <div className="text-2xl font-bold text-green-400">{stats.paid}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-white/50 text-xs mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-white/50 text-xs mb-1">Total Commission</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalCommission)}</div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : referrals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-bold text-white mb-2">No Referrals Yet</h3>
            <p className="text-white/50">Referrals will appear here when users make purchases using referral codes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-left text-xs text-white/40">
                  <th className="px-6 py-4 font-medium">Referrer</th>
                  <th className="px-6 py-4 font-medium">Referred User</th>
                  <th className="px-6 py-4 font-medium">Code</th>
                  <th className="px-6 py-4 font-medium">Order</th>
                  <th className="px-6 py-4 font-medium">Commission</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {referrals.map((referral) => (
                  <tr key={referral.id} className="text-sm hover:bg-white/3">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{referral.referrer.name}</div>
                      <div className="text-white/40 text-xs">{referral.referrer.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{referral.referredUser.name}</div>
                      <div className="text-white/40 text-xs">{referral.referredUser.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded text-xs">
                        {referral.referralCode}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      {referral.order ? (
                        <div>
                          <div className="text-white">{referral.order.orderNumber}</div>
                          <div className="text-white/40 text-xs">
                            {formatCurrency(referral.order.amount)}
                          </div>
                          <div className="text-xs">
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              referral.order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                              referral.order.status === 'CONFIRMED' ? 'bg-blue-500/20 text-blue-400' :
                              referral.order.status === 'IN_PROGRESS' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {referral.order.status}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-white/40">No order yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-yellow-400 font-semibold">
                        {referral.commissionAmount
                          ? formatCurrency(Number(referral.commissionAmount))
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          referral.isPaid
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {referral.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/40">{formatDate(referral.createdAt)}</td>
                    <td className="px-6 py-4">
                      {!referral.isPaid && referral.commissionAmount && (
                        <button
                          onClick={() => markAsPaid(referral.id)}
                          className="text-green-400 hover:text-green-300 text-xs"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
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
