'use client'
import { useEffect, useState } from 'react'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface Service {
  id: string
  name: string
  description: string
  price: number
  category: string
  icon?: string
  features: string[]
  deliveryDays: number
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((d) => { if (d.success) setServices(d.data.services) })
      .finally(() => setLoading(false))
  }, [])

  const handleOrder = async (serviceId: string) => {
    setOrdering(serviceId)
    const token = localStorage.getItem('access_token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ serviceId, referralCode: user.referralCode }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(data.data.orderNumber)
        setTimeout(() => setSuccess(null), 4000)
      }
    } finally {
      setOrdering(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Browse Services</h1>
        <p className="text-white/50 text-sm mt-1">Choose a service to get started</p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm">
          ✓ Order {success} placed successfully! Go to My Orders to track it.
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white/5 border border-white/10 hover:border-purple-500/40 rounded-2xl p-6 transition-all duration-300 flex flex-col">
              <div className="text-3xl mb-3">{service.icon || '⚡'}</div>
              <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4 flex-1">{service.description}</p>

              {service.features?.length > 0 && (
                <ul className="space-y-1 mb-4">
                  {service.features.slice(0, 3).map((f) => (
                    <li key={f} className="text-xs text-white/50 flex items-center gap-2">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className="text-yellow-400 font-bold text-lg">{formatCurrency(service.price)}</span>
                <span className="text-white/40 text-xs">{service.deliveryDays} days delivery</span>
              </div>

              <Button
                onClick={() => handleOrder(service.id)}
                loading={ordering === service.id}
                className="w-full"
                size="sm"
              >
                Order Now
              </Button>
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
    </div>
  )
}
