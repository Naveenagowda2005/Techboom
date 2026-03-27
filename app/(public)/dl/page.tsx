import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Driving License Services',
  description: 'Hassle-free DL application, renewal, and RC transfer services.',
}

export default function DrivingLicensePage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="section-padding text-center">
          <div className="container-max">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Driving License</span>
            <h1 className="text-5xl sm:text-6xl font-black text-white mt-3 mb-6">
              DL Services <span className="gradient-text">Made Easy</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              New DL, renewal, RC transfer — we handle all the paperwork so you don&apos;t have to.
            </p>
            <Link href="/signup" className="btn-primary text-base px-8 py-4">Apply Now</Link>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-max">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '🪪', title: 'New DL', price: '₹499', desc: 'Fresh driving license application with slot booking.' },
                { icon: '🔄', title: 'DL Renewal', price: '₹399', desc: 'Renew your expired or expiring driving license.' },
                { icon: '🚗', title: 'RC Transfer', price: '₹799', desc: 'Vehicle ownership transfer made simple.' },
                { icon: '📋', title: 'DL Duplicate', price: '₹349', desc: 'Lost your DL? Get a duplicate quickly.' },
              ].map((s) => (
                <div key={s.title} className="glass-card p-6 hover:border-purple-500/40 transition-all text-center">
                  <div className="text-4xl mb-4">{s.icon}</div>
                  <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                  <div className="text-yellow-400 font-bold text-lg mb-3">{s.price}</div>
                  <p className="text-white/60 text-sm mb-4">{s.desc}</p>
                  <Link href="/signup" className="btn-primary text-sm px-4 py-2 inline-flex">Apply Now</Link>
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
