'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number
  images: string[]
  category: string
  stock: number
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    fetch(`/api/products?search=${search}`)
      .then(r => r.json())
      .then(d => { if (d.success) setProducts(d.data.products) })
      .finally(() => setLoading(false))
  }, [search])

  const nextImage = (productId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages
    }))
  }

  const prevImage = (productId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages
    }))
  }

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="section-padding">
          <div className="container-max">
            <div className="text-center mb-12">
              <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Marketplace</span>
              <h1 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">Product Store</h1>
              <p className="text-white/50 max-w-xl mx-auto">Discover quality products from verified sellers.</p>
            </div>

            {/* Search */}
            <div className="max-w-md mx-auto mb-10">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field"
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🛍️</div>
                <p className="text-white/50">No products found. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => {
                  const currentIndex = currentImageIndex[product.id] || 0
                  const hasMultipleImages = product.images && product.images.length > 1
                  
                  return (
                    <div 
                      key={product.id} 
                      className="bg-white/5 border border-white/10 hover:border-purple-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      <div className="aspect-square bg-white/5 flex items-center justify-center overflow-hidden relative group">
                        {product.images && product.images.length > 0 ? (
                          <>
                            <img
                              src={product.images[currentIndex]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.parentElement!.innerHTML = '<div class="text-5xl">🛍️</div>'
                              }}
                            />
                            {hasMultipleImages && hoveredProduct === product.id && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    prevImage(product.id, product.images.length)
                                  }}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ‹
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    nextImage(product.id, product.images.length)
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ›
                                </button>
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                  {currentIndex + 1} / {product.images.length}
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="text-5xl">🛍️</div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-white mb-1 line-clamp-2">{product.name}</h3>
                        <p className="text-white/50 text-xs mb-3 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            {product.salePrice ? (
                              <div>
                                <span className="text-yellow-400 font-bold">{formatCurrency(product.salePrice)}</span>
                                <span className="text-white/30 text-xs line-through ml-2">{formatCurrency(product.price)}</span>
                              </div>
                            ) : (
                              <span className="text-yellow-400 font-bold">{formatCurrency(product.price)}</span>
                            )}
                          </div>
                          <Link href="/signup" className="btn-primary text-xs px-3 py-1.5">Buy Now</Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
