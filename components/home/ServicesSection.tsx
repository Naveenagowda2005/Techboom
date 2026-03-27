import Link from 'next/link'

const services = [
  {
    icon: '📱',
    title: 'App Development',
    description: 'Native & cross-platform mobile apps for iOS and Android with modern UI/UX.',
    href: '/app',
    price: 'From ₹15,000',
    color: 'from-purple-500/20 to-purple-600/10',
    border: 'hover:border-purple-500/50',
  },
  {
    icon: '🌐',
    title: 'Web Development',
    description: 'Fast, SEO-optimized websites and web apps built with modern tech stacks.',
    href: '/web',
    price: 'From ₹8,000',
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'hover:border-blue-500/50',
  },
  {
    icon: '📊',
    title: 'GST Services',
    description: 'GST registration, filing, and compliance management by certified experts.',
    href: '/gst',
    price: 'From ₹999',
    color: 'from-green-500/20 to-green-600/10',
    border: 'hover:border-green-500/50',
  },
  {
    icon: '🪪',
    title: 'Driving License',
    description: 'Hassle-free DL application, renewal, and RC transfer services.',
    href: '/dl',
    price: 'From ₹499',
    color: 'from-yellow-500/20 to-yellow-600/10',
    border: 'hover:border-yellow-500/50',
  },
  {
    icon: '🛒',
    title: 'E-Commerce Setup',
    description: 'Complete online store setup on Shopify, WooCommerce, or custom platforms.',
    href: '/ecommerce',
    price: 'From ₹12,000',
    color: 'from-orange-500/20 to-orange-600/10',
    border: 'hover:border-orange-500/50',
  },
  {
    icon: '🎯',
    title: 'Influencer Marketing',
    description: 'Connect with top influencers and run data-driven marketing campaigns.',
    href: '/influencer',
    price: 'From ₹5,000',
    color: 'from-pink-500/20 to-pink-600/10',
    border: 'hover:border-pink-500/50',
  },
]

export default function ServicesSection() {
  return (
    <section id="services" className="section-padding">
      <div className="container-max">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">What We Offer</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            All Services, One Platform
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Everything your business needs to grow digitally — under one roof.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className={`group relative bg-gradient-to-br ${service.color} border border-white/10 ${service.border} rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">{service.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 font-semibold text-sm">{service.price}</span>
                <span className="text-white/40 group-hover:text-white/80 transition-colors text-sm">
                  Learn more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
