'use client'
import { useEffect, useState } from 'react'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import Input from '@/components/ui/Input'
import StatsCard from '@/components/dashboard/StatsCard'

interface Payment {
  id: string
  razorpayOrderId: string
  razorpayPaymentId: string | null
  amount: number
  currency: string
  status: string
  createdAt: string
  order: {
    orderNumber: string
    user: { name: string; email: string }
    service: { name: string; category: string }
  }
}

interface PaymentStats {
  totalPayments: number
  successfulPayments: number
  pendingPayments: number
  failedPayments: number
  totalRevenue: number
  todayRevenue: number
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  useEffect(() => {
    fetchPayments()
    fetchStats()
  }, [statusFilter])

  const fetchPayments = async () => {
    setLoading(true)
    const token = localStorage.getItem('access_token')
    const cacheBuster = Date.now()
    const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : ''
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
    
    try {
      const res = await fetch(`/api/payments?_=${cacheBuster}${statusParam}${searchParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setPayments(data.data.payments)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    const token = localStorage.getItem('access_token')
    const cacheBuster = Date.now()
    
    try {
      const res = await fetch(`/api/payments/stats?_=${cacheBuster}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setStats(data.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPayments()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-400 bg-green-500/10'
      case 'PENDING': return 'text-yellow-400 bg-yellow-500/10'
      case 'FAILED': return 'text-red-400 bg-red-500/10'
      case 'REFUNDED': return 'text-blue-400 bg-blue-500/10'
      default: return 'text-white/40 bg-white/5'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Payments</h1>
        <p className="text-white/50 text-sm mt-1">Manage payments and transactions</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard 
            title="Total Revenue" 
            value={formatCurrency(stats.totalRevenue)} 
            icon="💰" 
            color="yellow" 
          />
          <StatsCard 
            title="Successful Payments" 
            value={stats.successfulPayments} 
            icon="✅" 
            color="green" 
          />
          <StatsCard 
            title="Pending Payments" 
            value={stats.pendingPayments} 
            icon="⏳" 
            color="blue" 
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <Input
              placeholder="Search by order number, payment ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500 [&>option]:bg-gray-900 [&>option]:text-white"
          >
            <option value="all">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Payment Transactions</h3>
        </div>

        {loading ? (
          <div className="p-6"><TableSkeleton rows={10} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-left text-xs text-white/40">
                  <th className="px-6 py-4 font-medium">Order #</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Payment ID</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((payment) => (
                  <tr key={payment.id} className="text-sm hover:bg-white/3">
                    <td className="px-6 py-4 text-purple-400 font-mono text-xs">
                      {payment.order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{payment.order.user.name}</div>
                      <div className="text-white/40 text-xs">{payment.order.user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{payment.order.service.name}</div>
                      <div className="text-white/40 text-xs">{payment.order.service.category}</div>
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white/60 font-mono text-xs">
                        {payment.razorpayPaymentId || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/40">{formatDate(payment.createdAt)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="text-purple-400 hover:text-purple-300 text-xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {payments.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">💳</div>
                <p className="text-white/50">No payments found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Payment Details</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-white/40 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium px-4 py-2 rounded-full ${getStatusColor(selectedPayment.status)}`}>
                  {selectedPayment.status}
                </span>
                <span className="text-2xl font-black text-white">
                  {formatCurrency(selectedPayment.amount)}
                </span>
              </div>

              {/* Order Information */}
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-bold text-white/60 uppercase">Order Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-white/40">Order Number</div>
                    <div className="text-white font-mono">{selectedPayment.order.orderNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40">Service</div>
                    <div className="text-white">{selectedPayment.order.service.name}</div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-bold text-white/60 uppercase">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-white/40">Name</div>
                    <div className="text-white">{selectedPayment.order.user.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40">Email</div>
                    <div className="text-white">{selectedPayment.order.user.email}</div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-bold text-white/60 uppercase">Payment Information</h4>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-white/40">Razorpay Order ID</div>
                    <div className="text-white font-mono text-sm">{selectedPayment.razorpayOrderId}</div>
                  </div>
                  {selectedPayment.razorpayPaymentId && (
                    <div>
                      <div className="text-xs text-white/40">Razorpay Payment ID</div>
                      <div className="text-white font-mono text-sm">{selectedPayment.razorpayPaymentId}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-white/40">Currency</div>
                    <div className="text-white">{selectedPayment.currency}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/40">Created At</div>
                    <div className="text-white">{formatDate(selectedPayment.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => setSelectedPayment(null)}
                className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
