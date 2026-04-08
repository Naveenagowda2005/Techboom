'use client'
import { useEffect, useState } from 'react'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import StatsCard from '@/components/dashboard/StatsCard'

interface ReferredUser {
  id: string
  name: string
  email: string
  createdAt: string
  orders: Array<{
    id: string
    orderNumber: string
    amount: number
    originalAmount?: number
    discountPercent?: number
    discountAmount?: number
    status: string
    createdAt: string
    service: { name: string }
  }>
}

interface Stats {
  totalSignups: number
  totalOrders: number
  totalEarnings: number
  conversionRate: string
}

export default function ReferralsPage() {
  const [data, setData] = useState<{ referredUsers: ReferredUser[]; stats: Stats } | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ referralCode: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ReferredUser | null>(null)

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Signups" value={data?.stats.totalSignups || 0} icon="👥" color="purple" />
        <StatsCard title="Total Orders" value={data?.stats.totalOrders || 0} icon="📦" color="blue" />
        <StatsCard title="Conversion Rate" value={`${data?.stats.conversionRate || 0}%`} icon="📈" color="green" />
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
          <h3 className="text-lg font-bold text-white">Referred Users</h3>
          <p className="text-white/50 text-sm">People who signed up using your referral link</p>
        </div>

        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} /></div>
        ) : !data?.referredUsers?.length ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔗</div>
            <p className="text-white/50">No referrals yet. Share your link to start earning!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-left text-xs text-white/40">
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium">Orders</th>
                  <th className="px-6 py-4 font-medium">Total Spent</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.referredUsers.map((user) => {
                  // Only count completed orders
                  const completedOrders = user.orders.filter(order => order.status === 'COMPLETED')
                  const totalSpent = completedOrders.reduce((sum, order) => sum + Number(order.amount), 0)
                  const hasOrdered = completedOrders.length > 0
                  
                  return (
                    <tr key={user.id} className="text-sm hover:bg-white/3">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-white/40 text-xs">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-xs">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-semibold">{completedOrders.length}</span>
                        {user.orders.length > completedOrders.length && (
                          <span className="text-white/40 text-xs ml-1">
                            ({user.orders.length - completedOrders.length} pending)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-yellow-400 font-semibold">
                          {formatCurrency(totalSpent)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {hasOrdered ? (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                            Active Customer
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                            Not Ordered Yet
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.orders.length > 0 ? (
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                          >
                            View Orders →
                          </button>
                        ) : (
                          <span className="text-white/30 text-sm">No orders</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gradient-to-br from-purple-900 to-indigo-900 z-10">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedUser.name}&apos;s Orders</h3>
                <p className="text-white/60 text-sm">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-white/40 hover:text-white text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {!selectedUser.orders || selectedUser.orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📦</div>
                  <p className="text-white/50">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedUser.orders.map((order) => {
                    const isCompleted = order.status === 'COMPLETED'
                    const statusColors = {
                      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                      CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                      IN_PROGRESS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
                      COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
                      CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
                    }

                    return (
                      <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-white font-bold text-lg">{order.service.name}</h4>
                              <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${statusColors[order.status as keyof typeof statusColors]}`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-white/40 text-sm">Order #{order.orderNumber}</p>
                          </div>
                          <div className="text-right">
                            {order.originalAmount && order.discountPercent && order.discountPercent > 0 ? (
                              <div>
                                <div className="text-white/40 text-sm line-through">{formatCurrency(order.originalAmount)}</div>
                                <div className="text-yellow-400 font-bold text-xl">{formatCurrency(order.amount)}</div>
                                <div className="text-green-400 text-xs">
                                  {order.discountPercent}% discount applied
                                </div>
                              </div>
                            ) : (
                              <div className="text-yellow-400 font-bold text-xl">{formatCurrency(order.amount)}</div>
                            )}
                            {isCompleted && (
                              <div className="text-purple-400 text-xs mt-2 bg-purple-500/10 px-2 py-1 rounded">
                                Your commission: {formatCurrency(Number(order.amount) * 0.1)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                          <div>
                            <div className="text-white/40 text-xs mb-1">Order Date</div>
                            <div className="text-white text-sm">{formatDate(order.createdAt)}</div>
                          </div>
                          <div>
                            <div className="text-white/40 text-xs mb-1">Status</div>
                            <div className="text-white text-sm">{order.status}</div>
                          </div>
                          {order.originalAmount && order.discountPercent && order.discountPercent > 0 && (
                            <>
                              <div>
                                <div className="text-white/40 text-xs mb-1">Original Price</div>
                                <div className="text-white/60 text-sm line-through">{formatCurrency(order.originalAmount)}</div>
                              </div>
                              <div>
                                <div className="text-white/40 text-xs mb-1">Discount</div>
                                <div className="text-green-400 text-sm">-{formatCurrency(order.discountAmount || 0)} ({order.discountPercent}%)</div>
                              </div>
                            </>
                          )}
                        </div>

                        {isCompleted && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-green-400 text-sm">
                                <span>✓</span>
                                <span>Commission earned from this order</span>
                              </div>
                              {order.originalAmount && order.discountPercent && order.discountPercent > 0 && (
                                <div className="text-white/60 text-xs">
                                  💡 Customer saved {formatCurrency(order.discountAmount || 0)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Summary */}
              {selectedUser.orders && selectedUser.orders.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-white/60 text-xs mb-1">Total Orders</div>
                      <div className="text-white font-bold text-xl">{selectedUser.orders.length}</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-white/60 text-xs mb-1">Completed Orders</div>
                      <div className="text-green-400 font-bold text-xl">
                        {selectedUser.orders.filter(o => o.status === 'COMPLETED').length}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-white/60 text-xs mb-1">Total Spent</div>
                      <div className="text-yellow-400 font-bold text-xl">
                        {formatCurrency(selectedUser.orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + Number(o.amount), 0))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
