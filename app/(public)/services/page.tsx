'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface Service {
  id: string
  name: string
  description: string
  price: string | number
  category: string
  icon?: string
  image?: string
  features: string[]
  deliveryDays: number
}

export default function PublicServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([
    { value: 'all', label: 'All Services' }
  ])
  const [viewingImage, setViewingImage] = useState<string | null>(null)

  // Fetch unique categories
  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
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
  }, [])

  useEffect(() => {
    const cacheBuster = Date.now()
    const url = selectedCategory === 'all' 
      ? `/api/services?_=${cacheBuster}` 
      : `/api/services?category=${selectedCategory}&_=${cacheBuster}`
    
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setServices(d.data.services)
      })
      .finally(() => setLoading(false))
  }, [selectedCategory])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <div className="container-max py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Our Services
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Browse our complete range of digital services. Sign up to place orders and start growing your business.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
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

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => setSelectedService(service)}
                className="bg-white/5 border border-white/10 hover:border-purple-500/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col cursor-pointer"
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
                  <div className="text-4xl mb-4">{service.icon || '⚡'}</div>
                )}
                <h3 className="text-xl font-bold text-white mb-3">{service.name}</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                  {service.description}
                </p>

                {service.features?.length > 0 && (
                  <ul className="space-y-2 mb-4">
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

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <div className="text-yellow-400 font-bold text-xl">
                      {formatCurrency(service.price)}
                    </div>
                    <div className="text-white/40 text-xs mt-1">
                      {service.deliveryDays} days delivery
                    </div>
                  </div>
                  <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && services.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">⚡</div>
            <p className="text-white/50">No services found in this category.</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-white/70 mb-6 max-w-xl mx-auto">
            Sign up now to place orders, track progress, and grow your business with our services.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              href="/login"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

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
                <div className="text-white/60 text-sm mb-1">Starting Price</div>
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
                  <h4 className="text-white font-bold mb-3">What's Included</h4>
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
                <Link
                  href="/signup"
                  className="block w-full bg-purple-500 hover:bg-purple-600 text-white text-center px-6 py-4 rounded-xl font-bold transition-colors"
                >
                  Sign Up to Order This Service
                </Link>
                <p className="text-white/40 text-xs text-center mt-3">
                  Already have an account? <Link href="/login" className="text-purple-400 hover:text-purple-300">Login here</Link>
                </p>
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
  )
}
