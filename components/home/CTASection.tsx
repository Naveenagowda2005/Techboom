import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="section-padding">
      <div className="container-max">
        <div className="text-center bg-gradient-to-br from-purple-600/20 via-purple-900/20 to-yellow-900/10 border border-purple-500/30 rounded-3xl py-20 px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-yellow-500/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6">
              Ready to{' '}
              <span className="bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
                Grow?
              </span>
            </h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto mb-10">
              Join 10,000+ businesses already growing with Techboom. Start for free today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="btn-accent text-base px-10 py-4 w-full sm:w-auto">
                Get Started Free →
              </Link>
              <Link href="#services" className="btn-outline text-base px-10 py-4 w-full sm:w-auto">
                View All Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
