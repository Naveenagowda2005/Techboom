import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'E-Commerce Setup',
  description: 'Complete online store setup on Shopify, WooCommerce, or custom platforms.',
}

export default function EcommercePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="section-padding text-center">
          <div className="container-max">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">E-Commerce</span>
            <h1 className="text-5xl sm:text-6xl font-black text-white mt-3 mb-6">
              Launch Your <span className="gradient-text">Online Store</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              Complete e-commerce setup with payment gateway, inventory management, and marketing tools.
            </p>
            <Link href="/signup" className="btn-primary text-base px-8 py-4">Start Selling Online</Link>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-max">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { name: 'Starter Store', price: '₹12,000', features: ['Shopify/WooCommerce', 'Up to 50 products', 'Payment gateway', 'Mobile responsive', '1 month support'] },
                { name: 'Growth Store', price: '₹25,000', features: ['Custom design', 'Up to 500 products', 'Multiple payments', 'SEO setup', 'Analytics', '3 months support'], popular: true },
                { name: 'Enterprise Store', price: '₹60,000+', features: ['Custom platform', 'Unlimited products', 'Multi-vendor', 'Advanced analytics', '1 year support'] },
              ].map((pkg) => (
                <div key={pkg.name} className={`rounded-2xl p-6 border ${(pkg as { popular?: boolean }).popular ? 'bg-gradient-to-br from-purple-600/30 to-purple-800/20 border-purple-500/50' : 'bg-white/5 border-white/10'}`}>
                  <h3 className="text-lg font-bold text-white mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-black text-yellow-400 mb-4">{pkg.price}</div>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((f) => (
                      <li key={f} className="text-sm text-white/70 flex items-center gap-2">
                        <span className="text-green-400">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="block text-center py-3 rounded-xl font-semibold text-sm btn-outline">
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
