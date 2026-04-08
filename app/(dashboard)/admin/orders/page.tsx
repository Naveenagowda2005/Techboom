'use client'
import { useEffect, useState } from 'react'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  status: string
  amount: number
  createdAt: string
  user: { name: string; email: string }
  service: { name: string; category: string }
  payment?: { status: string }
}

const STATUSES = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 })
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchOrders = (p = page) => {
    setLoading(true)
    const token = localStorage.getItem('access_token')
    fetch(`/api/orders?page=${p}&limit=15`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) { setOrders(d.data.orders); setMeta(d.data.meta) } })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [page])

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    const token = localStorage.getItem('access_token')
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    fetchOrders()
    setUpdating(null)
  }

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this unpaid order?')) return
    
    setDeleting(orderId)
    const token = localStorage.getItem('access_token')
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const data = await res.json()
      
      if (data.success) {
        fetchOrders()
      } else {
        alert(data.message || 'Failed to delete order')
      }
    } catch {
      alert('Failed to delete order')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">All Orders</h1>
        <p className="text-white/50 text-sm mt-1">{meta.total} total orders</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-left text-xs text-white/40">
                  <th className="px-6 py-4 font-medium">Order #</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="text-sm hover:bg-white/3">
                    <td className="px-6 py-4 text-purple-400 font-mono text-xs">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{order.user.name}</div>
                      <div className="text-white/40 text-xs">{order.user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-white/80">{order.service.name}</td>
                    <td className="px-6 py-4 text-white font-semibold">{formatCurrency(order.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium ${order.payment?.status === 'SUCCESS' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {order.payment?.status || 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-white/40">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/admin/orders/${order.id}`}
                          className="text-purple-400 hover:text-purple-300 text-xs font-medium"
                        >
                          View →
                        </a>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          disabled={updating === order.id}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-500/60 disabled:opacity-50 [&>option]:bg-gray-900 [&>option]:text-white"
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handleDelete(order.id)}
                            disabled={deleting === order.id}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded-lg text-xs transition-colors disabled:opacity-50"
                            title="Delete unpaid order"
                          >
                            {deleting === order.id ? '...' : '🗑️'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <span className="text-sm text-white/40">Page {page} of {meta.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30">← Prev</button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
