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

  useEffect(() => {
    fetch(`/api/products?search=${search}`)
      .then(r => r.json())
      .then(d => { if (d.success) setProducts(d.data.products) })
      .finally(() => setLoading(false))
  }, [search])

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
                {products.map((product) => (
                  <div key={product.id} className="bg-white/5 border border-white/10 hover:border-purple-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-square bg-white/5 flex items-center justify-center text-5xl">
                      🛍️
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
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
