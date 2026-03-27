'use client'
import { useEffect, useState } from 'react'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface Order {
  id: string
  orderNumber: string
  status: string
  amount: number
  createdAt: string
  service: { name: string; category: string; icon?: string }
  payment?: { status: string }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 })

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    fetch(`/api/orders?page=${page}&limit=10`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setOrders(d.data.orders)
          setMeta(d.data.meta)
        }
      })
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">My Orders</h1>
          <p className="text-white/50 text-sm mt-1">{meta.total} total orders</p>
        </div>
        <Link href="/dashboard/services" className="btn-primary text-sm">
          + New Order
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={6} /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-white/50 mb-4">No orders yet</p>
            <Link href="/dashboard/services" className="btn-primary text-sm">
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr className="text-left text-xs text-white/40">
                  <th className="px-6 py-4 font-medium">Order #</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="text-sm hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4 text-purple-400 font-mono text-xs">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{order.service.name}</div>
                      <div className="text-white/40 text-xs">{order.service.category}</div>
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">{formatCurrency(order.amount)}</td>
                    <td className="px-6 py-4">
                      {order.payment ? (
                        <span className={`text-xs font-medium ${order.payment.status === 'SUCCESS' ? 'text-green-400' : 'text-yellow-400'}`}>
                          {order.payment.status}
                        </span>
                      ) : (
                        <span className="text-white/30 text-xs">Unpaid</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-white/40">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/orders/${order.id}`} className="text-purple-400 hover:text-purple-300 text-xs">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
            <span className="text-sm text-white/40">Page {page} of {meta.totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
