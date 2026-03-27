import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'App Development',
  description: 'Professional mobile app development for iOS and Android. Native and cross-platform solutions.',
}

const features = [
  { icon: '📱', title: 'iOS & Android', desc: 'Native apps for both platforms with optimal performance.' },
  { icon: '⚡', title: 'React Native / Flutter', desc: 'Cross-platform development for faster delivery.' },
  { icon: '🎨', title: 'UI/UX Design', desc: 'Beautiful, intuitive interfaces that users love.' },
  { icon: '🔒', title: 'Secure & Scalable', desc: 'Enterprise-grade security and cloud-ready architecture.' },
  { icon: '🚀', title: 'App Store Launch', desc: 'Full support for Play Store and App Store submission.' },
  { icon: '🛠️', title: 'Maintenance', desc: 'Ongoing support, updates, and bug fixes.' },
]

const packages = [
  { name: 'Starter', price: '₹15,000', features: ['Single platform', 'Up to 5 screens', 'Basic UI', '1 month support'], popular: false },
  { name: 'Professional', price: '₹35,000', features: ['Both platforms', 'Up to 15 screens', 'Custom UI/UX', 'API integration', '3 months support'], popular: true },
  { name: 'Enterprise', price: '₹75,000+', features: ['Both platforms', 'Unlimited screens', 'Premium design', 'Backend included', '1 year support'], popular: false },
]

export default function AppDevelopmentPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="section-padding text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
          </div>
          <div className="container-max relative z-10">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">App Development</span>
            <h1 className="text-5xl sm:text-6xl font-black text-white mt-3 mb-6">
              Build Apps That <span className="gradient-text">Users Love</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              From concept to App Store — we build fast, beautiful, and scalable mobile applications for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="btn-primary text-base px-8 py-4">Get a Free Quote</Link>
              <Link href="#packages" className="btn-outline text-base px-8 py-4">View Packages</Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section-padding">
          <div className="container-max">
            <h2 className="text-3xl font-black text-white text-center mb-12">What&apos;s Included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => (
                <div key={f.title} className="glass-card p-6 hover:border-purple-500/40 transition-all">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-white/60 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section id="packages" className="section-padding">
          <div className="container-max">
            <h2 className="text-3xl font-black text-white text-center mb-12">Pricing Packages</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {packages.map((pkg) => (
                <div key={pkg.name} className={`relative rounded-2xl p-6 border ${pkg.popular ? 'bg-gradient-to-br from-purple-600/30 to-purple-800/20 border-purple-500/50' : 'bg-white/5 border-white/10'}`}>
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-white mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-black text-yellow-400 mb-4">{pkg.price}</div>
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((f) => (
                      <li key={f} className="text-sm text-white/70 flex items-center gap-2">
                        <span className="text-green-400">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${pkg.popular ? 'btn-accent' : 'btn-outline'}`}>
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
