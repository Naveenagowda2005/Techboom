import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GST Services',
  description: 'GST registration, filing, and compliance management by certified experts.',
}

const services = [
  { icon: '📝', title: 'GST Registration', price: '₹999', desc: 'Get your GSTIN in 3-5 working days.' },
  { icon: '📊', title: 'GST Return Filing', price: '₹499/month', desc: 'GSTR-1, GSTR-3B, and annual returns.' },
  { icon: '🔍', title: 'GST Audit', price: '₹2,999', desc: 'Comprehensive GST audit and compliance check.' },
  { icon: '📋', title: 'GST Cancellation', price: '₹1,499', desc: 'Hassle-free GST cancellation process.' },
]

export default function GSTPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="section-padding text-center">
          <div className="container-max">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">GST Services</span>
            <h1 className="text-5xl sm:text-6xl font-black text-white mt-3 mb-6">
              GST Made <span className="gradient-text">Simple</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              Expert GST registration, filing, and compliance — handled by certified professionals.
            </p>
            <Link href="/signup" className="btn-primary text-base px-8 py-4">Get Started Today</Link>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-max">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((s) => (
                <div key={s.title} className="glass-card p-6 hover:border-purple-500/40 transition-all text-center">
                  <div className="text-4xl mb-4">{s.icon}</div>
                  <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                  <div className="text-yellow-400 font-bold text-lg mb-3">{s.price}</div>
                  <p className="text-white/60 text-sm mb-4">{s.desc}</p>
                  <Link href="/signup" className="btn-primary text-sm px-4 py-2 inline-flex">Book Now</Link>
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
