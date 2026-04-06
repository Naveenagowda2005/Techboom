'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Service {
  id: string
  name: string
  description: string
  price: string | number
  icon?: string
  image?: string
  category: string
}

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('[ServicesSection] Fetching services...')
    const cacheBuster = Date.now()
    fetch(`/api/services?limit=6&_=${cacheBuster}`)
      .then((r) => r.json())
      .then((d) => {
        console.log('[ServicesSection] API Response:', d)
        if (d.success) {
          console.log('[ServicesSection] Setting services:', d.data.services)
          setServices(d.data.services)
        }
      })
      .catch((err) => console.error('[ServicesSection] Fetch error:', err))
      .finally(() => {
        console.log('[ServicesSection] Loading complete')
        setLoading(false)
      })
  }, [])

  return (
    <section id="services" className="section-padding">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">What We Offer</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            All Services, One Platform
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Everything your business needs to grow digitally — under one roof.
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service.id}
                href="/services"
                className="group relative bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-white/10 hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
              >
                <div className="text-4xl mb-4">{service.icon || '⚡'}</div>
                <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-3">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 font-semibold text-sm">
                    From ₹{typeof service.price === 'number' ? service.price.toLocaleString() : Number(service.price).toLocaleString()}
                  </span>
                  <span className="text-white/40 group-hover:text-white/80 transition-colors text-sm">
                    Learn more →
                  </span>
                </div>
              </Link>
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
    </section>
  )
}
