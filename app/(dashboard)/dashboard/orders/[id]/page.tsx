'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  status: string
  amount: number
  createdAt: string
  updatedAt: string
  notes?: string
  requirements?: string
  service: {
    id: string
    name: string
    description: string
    category: string
    icon?: string
    image?: string
    features: string[]
    deliveryDays: number
  }
  payment?: {
    id: string
    status: string
    razorpayPaymentId?: string
    createdAt: string
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    fetch(`/api/orders/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setOrder(d.data)
        } else {
          alert('Order not found')
          router.push('/dashboard/orders')
        }
      })
      .catch(() => {
        alert('Failed to load order')
        router.push('/dashboard/orders')
      })
      .finally(() => setLoading(false))
  }, [params.id, router])

  // Real-time countdown timer
  useEffect(() => {
    if (!order) return

    const calculateTimeRemaining = () => {
      // Don't start timer for PENDING orders
      if (order.status === 'PENDING') {
        const fullDays = order.service.deliveryDays
        setTimeRemaining({ days: fullDays, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const startDate = order.payment?.createdAt ? new Date(order.payment.createdAt) : new Date(order.createdAt)
      const expectedDeliveryDate = new Date(startDate)
      expectedDeliveryDate.setDate(startDate.getDate() + order.service.deliveryDays)
      
      const now = new Date()
      const diff = expectedDeliveryDate.getTime() - now.getTime()
      
      if (diff <= 0 || order.status === 'COMPLETED') {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      setTimeRemaining({ days, hours, minutes, seconds })
    }
    
    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)
    
    return () => clearInterval(interval)
  }, [order])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/50">Loading order details...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/50">Order not found</div>
      </div>
    )
  }

  const statusColors = {
    PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    IN_PROGRESS: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
    CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  const paymentStatusColors = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    SUCCESS: 'bg-green-500/20 text-green-400',
    FAILED: 'bg-red-500/20 text-red-400',
  }

  // Calculate expected delivery date
  // For PENDING orders, use current date as reference (timer hasn't started)
  // For CONFIRMED+ orders, use payment confirmation date as start
  const startDate = order.status === 'PENDING' 
    ? new Date() 
    : (order.payment?.createdAt ? new Date(order.payment.createdAt) : new Date(order.createdAt))
  
  const orderDate = new Date(order.createdAt)
  const expectedDeliveryDate = new Date(startDate)
  expectedDeliveryDate.setDate(startDate.getDate() + order.service.deliveryDays)
  
  // Calculate progress based on order status
  const now = new Date()
  const totalDuration = expectedDeliveryDate.getTime() - startDate.getTime()
  const elapsed = now.getTime() - startDate.getTime()
  const timeBasedProgress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)
  
  // Status-based progress (more accurate)
  const statusProgress = {
    'PENDING': 0, // No progress until payment
    'CONFIRMED': 25,
    'IN_PROGRESS': 60,
    'COMPLETED': 100,
    'CANCELLED': 0
  }
  
  // Use the higher of time-based or status-based progress
  const progressPercentage = order.status === 'COMPLETED' ? 100 : 
                            order.status === 'CANCELLED' ? 0 :
                            order.status === 'PENDING' ? 0 : // No progress for pending
                            Math.max(statusProgress[order.status as keyof typeof statusProgress] || 0, timeBasedProgress)
  
  const daysRemaining = order.status === 'PENDING' 
    ? order.service.deliveryDays // Show full delivery days for pending
    : Math.ceil((expectedDeliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  const isOverdue = daysRemaining < 0 && order.status !== 'COMPLETED' && order.status !== 'PENDING'
  const isCompleted = order.status === 'COMPLETED'

  // Timeline steps based on order status
  const timelineSteps = [
    { 
      label: 'Order Created', 
      status: 'PENDING', 
      completed: true, // Always completed once order exists
      date: orderDate,
      description: 'Order created. Awaiting payment confirmation.'
    },
    { 
      label: 'Payment Confirmed', 
      status: 'CONFIRMED', 
      completed: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(order.status), 
      date: order.payment?.createdAt ? new Date(order.payment.createdAt) : null,
      description: 'Payment verified. Order confirmed and ready to start.'
    },
    { 
      label: 'In Progress', 
      status: 'IN_PROGRESS', 
      completed: ['IN_PROGRESS', 'COMPLETED'].includes(order.status), 
      date: order.status === 'IN_PROGRESS' || order.status === 'COMPLETED' ? new Date(order.updatedAt) : null,
      description: 'Team is actively working on this service.'
    },
    { 
      label: 'Completed', 
      status: 'COMPLETED', 
      completed: order.status === 'COMPLETED', 
      date: order.status === 'COMPLETED' ? new Date(order.updatedAt) : null,
      description: 'Service delivered successfully to customer.'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/dashboard/orders')}
            className="text-white/50 hover:text-white text-sm mb-2 flex items-center gap-2"
          >
            ← Back to Orders
          </button>
          <h1 className="text-2xl font-black text-white">Order Details</h1>
          <p className="text-white/50 text-sm mt-1">Order #{order.orderNumber}</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border text-sm font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
          {order.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Timeline */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">Delivery Timeline</h2>
            
            {/* Expected Delivery Date Card */}
            <div className={`rounded-xl p-4 mb-6 ${isCompleted ? 'bg-green-500/10 border border-green-500/30' : isOverdue ? 'bg-red-500/10 border border-red-500/30' : 'bg-purple-500/10 border border-purple-500/30'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/60 text-sm mb-1">
                    {isCompleted ? 'Delivered On' : 'Expected Delivery'}
                  </div>
                  <div className={`text-2xl font-bold ${isCompleted ? 'text-green-400' : isOverdue ? 'text-red-400' : 'text-purple-400'}`}>
                    {expectedDeliveryDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-sm mb-1">
                    {isCompleted ? 'Status' : isOverdue ? 'Overdue by' : 'Time Remaining'}
                  </div>
                  {isCompleted ? (
                    <div className="text-2xl font-bold text-green-400">✓ Done</div>
                  ) : isOverdue ? (
                    <div className="text-2xl font-bold text-red-400">{Math.abs(daysRemaining)} days</div>
                  ) : (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {timeRemaining.days}d {timeRemaining.hours}h
                      </div>
                      <div className="text-sm text-white/60">
                        {timeRemaining.minutes}m {timeRemaining.seconds}s
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              {!isCompleted && (
                <div className="mt-4">
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${isOverdue ? 'bg-red-500' : 'bg-purple-500'}`}
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/40 mt-2">
                    <span>Started: {orderDate.toLocaleDateString()}</span>
                    <span>{Math.round(progressPercentage)}% Complete</span>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline Steps */}
            <div className="space-y-4">
              {timelineSteps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  {/* Icon */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      step.completed 
                        ? 'bg-green-500/20 border-green-500 text-green-400' 
                        : 'bg-white/5 border-white/20 text-white/40'
                    }`}>
                      {step.completed ? '✓' : index + 1}
                    </div>
                    {index < timelineSteps.length - 1 && (
                      <div className={`w-0.5 h-12 ${step.completed ? 'bg-green-500/30' : 'bg-white/10'}`} />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-semibold ${step.completed ? 'text-white' : 'text-white/40'}`}>
                        {step.label}
                      </h4>
                      {step.date && (
                        <span className="text-xs text-white/50">
                          {step.date.toLocaleDateString()} {step.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/50">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Service Details</h2>
            
            <div className="flex gap-4">
              {order.service.image ? (
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                  <img 
                    src={order.service.image} 
                    alt={order.service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-white/5 flex items-center justify-center text-4xl flex-shrink-0">
                  {order.service.icon || '⚡'}
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{order.service.name}</h3>
                <p className="text-white/60 text-sm mb-3">{order.service.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-purple-400">{order.service.category}</span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60">{order.service.deliveryDays} days delivery</span>
                </div>
              </div>
            </div>

            {order.service.features?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-white font-semibold mb-3">What's Included</h4>
                <ul className="space-y-2">
                  {order.service.features.map((feature, idx) => (
                    <li key={idx} className="text-white/70 text-sm flex items-start gap-3">
                      <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Requirements & Notes */}
          {(order.requirements || order.notes) && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Additional Information</h2>
              
              {order.requirements && (
                <div className="mb-4">
                  <h4 className="text-white/70 text-sm font-medium mb-2">Requirements</h4>
                  <p className="text-white/90">{order.requirements}</p>
                </div>
              )}
              
              {order.notes && (
                <div>
                  <h4 className="text-white/70 text-sm font-medium mb-2">Notes</h4>
                  <p className="text-white/90">{order.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Order Number</span>
                <span className="text-white font-medium">{order.orderNumber}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Order Date</span>
                <span className="text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Last Updated</span>
                <span className="text-white">{new Date(order.updatedAt).toLocaleDateString()}</span>
              </div>
              
              <div className="pt-3 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Total Amount</span>
                  <span className="text-yellow-400 font-bold text-xl">{formatCurrency(order.amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {order.payment && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Payment Information</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Payment Status</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${paymentStatusColors[order.payment.status as keyof typeof paymentStatusColors]}`}>
                    {order.payment.status}
                  </span>
                </div>
                
                {order.payment.razorpayPaymentId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Payment ID</span>
                    <span className="text-white font-mono text-xs">{order.payment.razorpayPaymentId.slice(0, 20)}...</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Payment Date</span>
                  <span className="text-white">{new Date(order.payment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Need Help?</h2>
            <p className="text-white/60 text-sm mb-4">
              If you have any questions about your order, please contact our support team.
            </p>
            <div className="space-y-2">
              <a
                href="tel:+917760322345"
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg">📞</span>
                Call Support
              </a>
              <a
                href="https://wa.me/917760322345"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg">💬</span>
                WhatsApp Support
              </a>
              <a
                href="mailto:support@techboom.com"
                className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-lg">✉️</span>
                Email Support
              </a>
            </div>
            <p className="text-white/40 text-xs mt-4 text-center">
              +91 7760322345 | support@techboom.com
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
