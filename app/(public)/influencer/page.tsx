import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Influencer Marketing',
  description: 'Connect with top influencers and run data-driven marketing campaigns.',
}

const platforms = ['Instagram', 'YouTube', 'Twitter/X', 'LinkedIn', 'TikTok', 'Facebook']

export default function InfluencerPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="section-padding text-center">
          <div className="container-max">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Influencer Marketing</span>
            <h1 className="text-5xl sm:text-6xl font-black text-white mt-3 mb-6">
              Amplify Your <span className="gradient-text">Brand Reach</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              Connect with verified influencers across all platforms and run campaigns that deliver real ROI.
            </p>
            <Link href="/signup" className="btn-primary text-base px-8 py-4">Launch a Campaign</Link>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-max">
            <h2 className="text-3xl font-black text-white text-center mb-8">Platforms We Cover</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {platforms.map((p) => (
                <div key={p} className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-white font-medium">
                  {p}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-max">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { name: 'Micro Campaign', price: '₹5,000', features: ['1-3 influencers', 'Nano/Micro tier', 'Campaign brief', 'Performance report'] },
                { name: 'Growth Campaign', price: '₹15,000', features: ['5-10 influencers', 'Micro/Macro tier', 'Content strategy', 'A/B testing', 'Detailed analytics'], popular: true },
                { name: 'Brand Campaign', price: '₹50,000+', features: ['20+ influencers', 'All tiers', 'Full management', 'PR support', 'Monthly reports'] },
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
