const testimonials = [
  {
    name: 'Arjun Sharma',
    role: 'Founder, StartupX',
    content: 'Techboom built our entire e-commerce platform in just 2 weeks. The quality was outstanding and the team was super responsive.',
    rating: 5,
    avatar: 'AS',
  },
  {
    name: 'Priya Patel',
    role: 'GST Consultant',
    content: 'Their GST filing service saved me hours every month. Accurate, timely, and completely hassle-free.',
    rating: 5,
    avatar: 'PP',
  },
  {
    name: 'Rohit Kumar',
    role: 'Digital Marketer',
    content: 'The referral program is amazing. I\'ve earned over ₹50,000 just by referring clients to Techboom.',
    rating: 5,
    avatar: 'RK',
  },
  {
    name: 'Meera Singh',
    role: 'Restaurant Owner',
    content: 'Got my food delivery app built at a fraction of the cost. Highly recommend for any small business.',
    rating: 5,
    avatar: 'MS',
  },
  {
    name: 'Vikram Nair',
    role: 'E-commerce Seller',
    content: 'The influencer campaign they ran for my brand generated 3x ROI. Will definitely work with them again.',
    rating: 5,
    avatar: 'VN',
  },
  {
    name: 'Anita Desai',
    role: 'CA Professional',
    content: 'Techboom handles all my clients\' GST compliance. The dashboard makes tracking everything so easy.',
    rating: 5,
    avatar: 'AD',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="section-padding bg-gradient-to-b from-purple-950/20 to-transparent">
      <div className="container-max">
        <div className="text-center mb-16">
          <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Testimonials</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            Loved by 10,000+ Businesses
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white/5 border border-white/10 hover:border-purple-500/30 rounded-2xl p-6 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>

              <p className="text-white/70 text-sm leading-relaxed mb-6">&ldquo;{t.content}&rdquo;</p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-white/40">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
