'use client'
import { useEffect, useState } from 'react'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ReferredUser {
  name: string
  email: string
  orders: Array<{
    orderNumber: string
    amount: number
    status: string
    commissionAmount: number
    isPaid: boolean
    createdAt: string
  }>
  signupDate: string
}

interface ReferrerGroup {
  referrer: {
    name: string
    email: string
    upiId: string | null
  }
  referralCode: string
  referredUsers: ReferredUser[]
  totalSignups: number
  totalOrders: number
  totalCommission: number
  paidCommission: number
  pendingCommission: number
}

export default function AdminReferralsPage() {
  const [referrers, setReferrers] = useState<ReferrerGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReferrer, setSelectedReferrer] = useState<ReferrerGroup | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    totalCommission: 0
  })
  const [backfilling, setBackfilling] = useState(false)

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
        
        // Group by referrer
        const grouped = new Map<string, ReferrerGroup>()
        
        referralsList.forEach((ref: any) => {
          const key = ref.referrer.email
          
          if (!grouped.has(key)) {
            grouped.set(key, {
              referrer: ref.referrer,
              referralCode: ref.referralCode,
              referredUsers: [],
              totalSignups: 0,
              totalOrders: 0,
              totalCommission: 0,
              paidCommission: 0,
              pendingCommission: 0
            })
          }
          
          const group = grouped.get(key)!
          
          // Find or create referred user entry
          let userEntry = group.referredUsers.find(u => u.email === ref.referredUser.email)
          if (!userEntry) {
            userEntry = {
              name: ref.referredUser.name,
              email: ref.referredUser.email,
              orders: [],
              signupDate: ref.createdAt
            }
            group.referredUsers.push(userEntry)
            group.totalSignups++
          }
          
          // Add order if exists
          if (ref.order) {
            userEntry.orders.push({
              orderNumber: ref.order.orderNumber,
              amount: ref.order.amount,
              status: ref.order.status,
              commissionAmount: ref.commissionAmount || 0,
              isPaid: ref.isPaid,
              createdAt: ref.createdAt
            })
            group.totalOrders++
            group.totalCommission += ref.commissionAmount || 0
            if (ref.isPaid) {
              group.paidCommission += ref.commissionAmount || 0
            } else {
              group.pendingCommission += ref.commissionAmount || 0
            }
          }
        })
        
        const referrersList = Array.from(grouped.values())
        setReferrers(referrersList)
        
        // Calculate overall stats
        const total = referrersList.reduce((sum, r) => sum + r.totalOrders, 0)
        const paid = referrersList.reduce((sum, r) => sum + r.paidCommission, 0)
        const pending = referrersList.reduce((sum, r) => sum + r.pendingCommission, 0)
        const totalCommission = referrersList.reduce((sum, r) => sum + r.totalCommission, 0)
        
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

  const markOrderAsPaid = async (order: any, referrer: ReferrerGroup) => {
    if (!confirm(`Mark commission of ${formatCurrency(order.commissionAmount)} as paid for order ${order.orderNumber}?`)) return

    const token = localStorage.getItem('access_token')
    
    // We need to find the referral ID from the API
    // For now, we'll need to update the order's referral record
    // The order ID format is either a real referral ID or "order-{orderId}"
    
    try {
      // We need to call an API to mark the referral as paid
      // Since we don't have the referral ID directly, we'll need to create an endpoint
      // For now, let's use a workaround - we'll update via order
      
      const res = await fetch('/api/referrals/mark-paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          orderNumber: order.orderNumber,
          referrerEmail: referrer.referrer.email
        })
      })

      const data = await res.json()
      if (data.success) {
        alert('Commission marked as paid successfully')
        fetchReferrals()
      } else {
        alert(data.message || 'Failed to mark as paid')
      }
    } catch (error) {
      console.error('Error marking as paid:', error)
      alert('Failed to mark commission as paid')
    }
  }

  const runBackfill = async () => {
    if (!confirm('This will create transaction records for all existing paid commissions. Continue?')) return

    setBackfilling(true)
    const token = localStorage.getItem('access_token')
    
    try {
      const res = await fetch('/api/admin/backfill-commissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      if (data.success) {
        alert(`Backfill completed!\n\nCreated: ${data.data.created}\nUpdated: ${data.data.updated}\nSkipped: ${data.data.skipped}\nTotal: ${data.data.total}`)
        fetchReferrals()
      } else {
        alert(data.message || 'Backfill failed')
      }
    } catch (error) {
      console.error('Error running backfill:', error)
      alert('Failed to run backfill')
    } finally {
      setBackfilling(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Referrals</h1>
          <p className="text-white/50 text-sm mt-1">Manage referral program and commissions</p>
        </div>
        <button
          onClick={runBackfill}
          disabled={backfilling}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {backfilling ? 'Running...' : 'Backfill Transactions'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-white/50 text-xs mb-1">Total Orders</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-white/50 text-xs mb-1">Paid Commission</div>
          <div className="text-2xl font-bold text-green-400">{formatCurrency(stats.paid)}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-white/50 text-xs mb-1">Pending Commission</div>
          <div className="text-2xl font-bold text-yellow-400">{formatCurrency(stats.pending)}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-white/50 text-xs mb-1">Total Commission</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalCommission)}</div>
        </div>
      </div>

      {/* Referrers Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} />
          </div>
        ) : referrers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-bold text-white mb-2">No Referrals Yet</h3>
            <p className="text-white/50">Referrals will appear here when users sign up using referral codes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-left text-xs text-white/40">
                  <th className="px-6 py-4 font-medium">Referrer</th>
                  <th className="px-6 py-4 font-medium">Code</th>
                  <th className="px-6 py-4 font-medium">Signups</th>
                  <th className="px-6 py-4 font-medium">Orders</th>
                  <th className="px-6 py-4 font-medium">Total Commission</th>
                  <th className="px-6 py-4 font-medium">Paid</th>
                  <th className="px-6 py-4 font-medium">Pending</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {referrers.map((referrer, idx) => (
                  <tr key={idx} className="text-sm hover:bg-white/3">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{referrer.referrer.name}</div>
                      <div className="text-white/40 text-xs">{referrer.referrer.email}</div>
                      {referrer.referrer.upiId && (
                        <div className="mt-1">
                          <code className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded text-xs">
                            UPI: {referrer.referrer.upiId}
                          </code>
                        </div>
                      )}
                      {!referrer.referrer.upiId && referrer.pendingCommission > 0 && (
                        <div className="text-yellow-400 text-xs mt-1">⚠️ No UPI ID</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded text-xs">
                        {referrer.referralCode}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-white">{referrer.totalSignups}</td>
                    <td className="px-6 py-4 text-white">{referrer.totalOrders}</td>
                    <td className="px-6 py-4">
                      <span className="text-yellow-400 font-semibold">
                        {formatCurrency(referrer.totalCommission)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-400">
                        {formatCurrency(referrer.paidCommission)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-yellow-400">
                        {formatCurrency(referrer.pendingCommission)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedReferrer(referrer)}
                        className="text-purple-400 hover:text-purple-300 text-xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedReferrer && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReferrer(null)}
        >
          <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 border border-white/10 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gradient-to-br from-purple-900 to-indigo-900 z-10">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedReferrer.referrer.name}&apos;s Referrals</h3>
                <p className="text-white/60 text-sm">{selectedReferrer.referrer.email}</p>
                {selectedReferrer.referrer.upiId ? (
                  <div className="mt-2">
                    <span className="text-white/60 text-xs">UPI ID: </span>
                    <code className="text-green-400 bg-green-500/10 px-2 py-1 rounded text-sm">
                      {selectedReferrer.referrer.upiId}
                    </code>
                  </div>
                ) : (
                  <div className="mt-2 text-yellow-400 text-sm">
                    ⚠️ No UPI ID provided yet
                  </div>
                )}
                <code className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded text-xs mt-2 inline-block">
                  {selectedReferrer.referralCode}
                </code>
              </div>
              <button
                onClick={() => setSelectedReferrer(null)}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-white/50 text-xs mb-1">Total Signups</div>
                  <div className="text-xl font-bold text-white">{selectedReferrer.totalSignups}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-white/50 text-xs mb-1">Total Orders</div>
                  <div className="text-xl font-bold text-white">{selectedReferrer.totalOrders}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-white/50 text-xs mb-1">Total Commission</div>
                  <div className="text-xl font-bold text-yellow-400">{formatCurrency(selectedReferrer.totalCommission)}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="text-white/50 text-xs mb-1">Conversion Rate</div>
                  <div className="text-xl font-bold text-green-400">
                    {selectedReferrer.totalSignups > 0 ? ((selectedReferrer.totalOrders / selectedReferrer.totalSignups) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>

              {/* Referred Users */}
              <div>
                <h4 className="text-lg font-bold text-white mb-4">Referred Users</h4>
                <div className="space-y-4">
                  {selectedReferrer.referredUsers.map((user, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-white/40 text-xs">{user.email}</div>
                          <div className="text-white/40 text-xs mt-1">Signed up: {formatDate(user.signupDate)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white/50 text-xs">Orders</div>
                          <div className="text-lg font-bold text-white">{user.orders.length}</div>
                        </div>
                      </div>

                      {user.orders.length > 0 ? (
                        <div className="space-y-2 mt-3 pt-3 border-t border-white/10">
                          {user.orders.map((order, orderIdx) => (
                            <div key={orderIdx} className="flex items-center justify-between text-sm bg-white/5 rounded-lg p-3">
                              <div>
                                <div className="text-white">{order.orderNumber}</div>
                                <div className="text-white/40 text-xs">{formatDate(order.createdAt)}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-white">{formatCurrency(order.amount)}</div>
                                <div className="text-yellow-400 text-xs">Commission: {formatCurrency(order.commissionAmount)}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  order.isPaid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {order.isPaid ? 'Paid' : 'Pending'}
                                </span>
                                {!order.isPaid && order.commissionAmount > 0 && (
                                  <>
                                    {selectedReferrer.referrer.upiId ? (
                                      <button
                                        onClick={() => markOrderAsPaid(order, selectedReferrer)}
                                        className="text-green-400 hover:text-green-300 text-xs px-2 py-1 bg-green-500/10 rounded"
                                      >
                                        Mark Paid
                                      </button>
                                    ) : (
                                      <span className="text-yellow-400 text-xs px-2 py-1 bg-yellow-500/10 rounded">
                                        No UPI ID
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-white/40 text-sm mt-3 pt-3 border-t border-white/10">
                          No orders yet
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
