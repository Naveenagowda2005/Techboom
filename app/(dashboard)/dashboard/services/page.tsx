'use client'
import { useEffect, useState } from 'react'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/lib/utils'
import Script from 'next/script'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface Service {
  id: string
  name: string
  description: string
  price: number
  category: string
  icon?: string
  image?: string
  features: string[]
  deliveryDays: number
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([
    { value: 'all', label: 'All Services' }
  ])
  const [viewingImage, setViewingImage] = useState<string | null>(null)
  const [userDiscount, setUserDiscount] = useState<{ percent: number; hasUsed: boolean } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    
    // Fetch user discount info
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.firstOrderDiscount > 0 && !d.data.hasUsedFirstOrderDiscount) {
          setUserDiscount({ 
            percent: d.data.firstOrderDiscount, 
            hasUsed: d.data.hasUsedFirstOrderDiscount 
          })
        }
      })
    
    fetch('/api/services')
      .then((r) => r.json())
      .then((d) => { 
        if (d.success) {
          setAllServices(d.data.services)
          setServices(d.data.services)
          
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(d.data.services.map((s: Service) => s.category))
          ).sort() as string[]
          
          const categoryOptions = [
            { value: 'all', label: 'All Services' },
            ...uniqueCategories.map((cat) => ({ value: cat, label: cat }))
          ]
          
          setCategories(categoryOptions)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedCategory === 'all') {
      setServices(allServices)
    } else {
      setServices(allServices.filter(s => s.category === selectedCategory))
    }
  }, [selectedCategory, allServices])

  const handleOrder = async (serviceId: string, serviceName: string, servicePrice: number) => {
    setOrdering(serviceId)
    const token = localStorage.getItem('access_token')

    try {
      // Step 0: Fetch fresh user data to get phone number
      const userRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const userData = await userRes.json()
      const user = userData.success ? userData.data : JSON.parse(localStorage.getItem('user') || '{}')

      // Step 1: Create order in database
      const orderPayload = { serviceId }
      
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderPayload),
      })
      const orderData = await orderRes.json()
      
      if (!orderData.success) {
        const errorMsg = orderData.error || orderData.message || 'Failed to create order'
        alert(errorMsg)
        return
      }

      const orderId = orderData.data.id
      const orderNumber = orderData.data.orderNumber

      // Step 2: Create Razorpay payment order
      const paymentRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, amount: servicePrice }),
      })
      const paymentData = await paymentRes.json()

      if (!paymentData.success) {
        alert(paymentData.error || 'Failed to initialize payment')
        return
      }

      // Step 3: Open Razorpay payment modal
      const options = {
        key: paymentData.data.keyId,
        amount: paymentData.data.amount,
        currency: 'INR',
        name: 'TechBoom',
        description: serviceName,
        order_id: paymentData.data.razorpayOrderId,
        handler: async function (response: any) {
          // Step 4: Verify payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          })
          const verifyData = await verifyRes.json()

          if (verifyData.success) {
            setSuccess(orderNumber)
            setTimeout(() => setSuccess(null), 5000)
          } else {
            alert('Payment verification failed')
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone ? user.phone.replace(/\D/g, '') : '', // Remove non-digits
        },
        theme: {
          color: '#a855f7',
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Order error:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setOrdering(null)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Browse Services</h1>
        <p className="text-white/50 text-sm mt-1">Choose a service to get started</p>
      </div>

      {/* First Order Discount Banner */}
      {userDiscount && userDiscount.percent > 0 && !userDiscount.hasUsed && (
        <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/20 border border-green-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎉</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">
                {userDiscount.percent}% OFF Your First Order!
              </h3>
              <p className="text-white/70 text-sm">
                Your referral discount will be applied automatically at checkout. Save big on your first service!
              </p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm">
          ✓ Order {success} placed successfully! Go to My Orders to track it.
        </div>
      )}

      {/* Category Filter */}
      <div className="flex justify-start">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-xl px-6 py-3 text-white text-sm focus:outline-none focus:border-purple-500 min-w-[200px] [&>option]:bg-gray-900 [&>option]:text-white"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div 
              key={service.id} 
              className="bg-white/5 border border-white/10 hover:border-purple-500/40 rounded-2xl p-6 transition-all duration-300 flex flex-col"
            >
              {service.image ? (
                <div 
                  className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-white/5 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    setViewingImage(service.image!)
                  }}
                >
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="text-3xl mb-3">{service.icon || '⚡'}</div>
              )}
              <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{service.description}</p>

              {service.features?.length > 0 && (
                <ul className="space-y-1 mb-4">
                  {service.features.slice(0, 3).map((f, idx) => (
                    <li key={idx} className="text-xs text-white/50 flex items-center gap-2 truncate">
                      <span className="text-green-400 flex-shrink-0">✓</span>
                      <span className="truncate">{f}</span>
                    </li>
                  ))}
                  {service.features.length > 3 && (
                    <li className="text-xs text-purple-400">+{service.features.length - 3} more...</li>
                  )}
                </ul>
              )}

              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-yellow-400 font-bold text-lg">{formatCurrency(service.price)}</span>
                  {userDiscount && userDiscount.percent > 0 && !userDiscount.hasUsed && (
                    <div className="text-xs text-green-400 mt-1">
                      After discount: {formatCurrency(service.price * (1 - userDiscount.percent / 100))}
                    </div>
                  )}
                </div>
                <span className="text-white/40 text-xs">{service.deliveryDays} days delivery</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedService(service)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleOrder(service.id, service.name, service.price)}
                  disabled={ordering === service.id}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  {ordering === service.id ? 'Ordering...' : 'Order Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && services.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">⚡</div>
          <p className="text-white/50">No services available yet.</p>
        </div>
      )}

      {/* Service Details Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedService(null)}>
          <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-gradient-to-br from-purple-900 to-indigo-900">
              <h3 className="text-2xl font-bold text-white">{selectedService.name}</h3>
              <button
                onClick={() => setSelectedService(null)}
                className="text-white/40 hover:text-white text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Image or Icon */}
              {selectedService.image ? (
                <div 
                  className="w-full h-64 rounded-xl overflow-hidden bg-white/5 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    setViewingImage(selectedService.image!)
                  }}
                >
                  <img 
                    src={selectedService.image} 
                    alt={selectedService.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{selectedService.icon || '⚡'}</div>
                  <div>
                    <div className="text-purple-400 text-sm font-medium">{selectedService.category}</div>
                    <div className="text-white/60 text-sm">{selectedService.deliveryDays} days delivery</div>
                  </div>
                </div>
              )}

              {/* Category and Delivery (when image exists) */}
              {selectedService.image && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-purple-400 font-medium">{selectedService.category}</div>
                  <div className="text-white/60">{selectedService.deliveryDays} days delivery</div>
                </div>
              )}

              {/* Price */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/60 text-sm mb-1">Service Price</div>
                <div className="text-yellow-400 font-black text-3xl">{formatCurrency(selectedService.price)}</div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-white font-bold mb-2">Description</h4>
                <p className="text-white/70 leading-relaxed">{selectedService.description}</p>
              </div>

              {/* Features */}
              {selectedService.features?.length > 0 && (
                <div>
                  <h4 className="text-white font-bold mb-3">What&apos;s Included</h4>
                  <ul className="space-y-2">
                    {selectedService.features.map((feature, idx) => (
                      <li key={idx} className="text-white/70 flex items-start gap-3">
                        <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedService(null)
                    handleOrder(selectedService.id, selectedService.name, selectedService.price)
                  }}
                  disabled={ordering === selectedService.id}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white px-6 py-4 rounded-xl font-bold transition-colors"
                >
                  {ordering === selectedService.id ? 'Processing...' : 'Order This Service Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4" 
          onClick={() => setViewingImage(null)}
        >
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-4 right-4 text-white/60 hover:text-white text-4xl leading-none z-10"
          >
            ×
          </button>
          <img 
            src={viewingImage} 
            alt="Full size preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
    </>
  )
}
