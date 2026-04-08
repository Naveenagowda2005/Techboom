'use client'
import { useEffect, useState } from 'react'
import { OrderStatusBadge } from '@/components/ui/Badge'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import Script from 'next/script'

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
  const [deleting, setDeleting] = useState<string | null>(null)
  const [paying, setPaying] = useState<string | null>(null)

  const fetchOrders = () => {
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
  }

  useEffect(() => {
    fetchOrders()
  }, [page])

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

  const handlePayment = async (order: Order) => {
    setPaying(order.id)
    const token = localStorage.getItem('access_token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    try {
      // Create Razorpay payment order
      const paymentRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: order.id, amount: order.amount }),
      })
      const paymentData = await paymentRes.json()

      if (!paymentData.success) {
        alert(paymentData.error || 'Failed to initialize payment')
        setPaying(null)
        return
      }

      // Open Razorpay payment modal
      const options = {
        key: paymentData.data.keyId,
        amount: paymentData.data.amount,
        currency: 'INR',
        name: 'TechBoom',
        description: order.service.name,
        order_id: paymentData.data.razorpayOrderId,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              orderId: order.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          })
          const verifyData = await verifyRes.json()

          if (verifyData.success) {
            alert('Payment successful!')
            fetchOrders()
          } else {
            alert('Payment verification failed')
          }
          setPaying(null)
        },
        modal: {
          ondismiss: function() {
            setPaying(null)
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: {
          color: '#a855f7',
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to initialize payment. Please try again.')
      setPaying(null)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
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
                      <div className="flex items-center gap-2">
                        {order.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handlePayment(order)}
                              disabled={paying === order.id}
                              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              <span>💳</span>
                              {paying === order.id ? 'Processing...' : 'Complete Payment'}
                            </button>
                            <button
                              onClick={() => handleDelete(order.id)}
                              disabled={deleting === order.id}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                              title="Delete order"
                            >
                              {deleting === order.id ? '...' : '🗑️'}
                            </button>
                          </>
                        ) : (
                          <Link 
                            href={`/dashboard/orders/${order.id}`} 
                            className="inline-flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                          >
                            <span>📍</span>
                            Track Order
                          </Link>
                        )}
                      </div>
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
    </>
  )
}
