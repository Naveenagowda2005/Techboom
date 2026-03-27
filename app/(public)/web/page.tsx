import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Web Development',
  description: 'Fast, SEO-optimized websites and web applications built with modern technologies.',
}

const techStack = ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'Tailwind CSS', 'TypeScript', 'AWS']

export default function WebDevelopmentPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <section className="section-padding text-center">
          <div className="container-max">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Web Development</span>
            <h1 className="text-5xl sm:text-6xl font-black text-white mt-3 mb-6">
              Websites That <span className="gradient-text">Convert</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              Fast, beautiful, and SEO-optimized websites that drive real business results.
            </p>
            <Link href="/signup" className="btn-primary text-base px-8 py-4">Start Your Project</Link>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-max">
            <h2 className="text-3xl font-black text-white text-center mb-8">Tech Stack We Use</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((tech) => (
                <span key={tech} className="bg-purple-500/10 border border-purple-500/30 text-purple-300 px-4 py-2 rounded-full text-sm font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-max">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { name: 'Landing Page', price: '₹8,000', features: ['1 page', 'Mobile responsive', 'SEO optimized', 'Contact form', '1 month support'] },
                { name: 'Business Website', price: '₹20,000', features: ['Up to 10 pages', 'CMS integration', 'SEO + Analytics', 'Blog setup', '3 months support'], popular: true },
                { name: 'Web Application', price: '₹50,000+', features: ['Custom features', 'User auth', 'Database', 'API integration', '1 year support'] },
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
