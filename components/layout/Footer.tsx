import Link from 'next/link'

const footerLinks = {
  Services: [
    { label: 'App Development', href: '/app' },
    { label: 'Web Development', href: '/web' },
    { label: 'GST Services', href: '/gst' },
    { label: 'Driving License', href: '/dl' },
    { label: 'E-Commerce Setup', href: '/ecommerce' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Refund Policy', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0618]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black">TB</span>
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
                Techboom
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-4">
              Your all-in-one digital growth partner. From app development to GST filing — we&apos;ve got you covered.
            </p>
            <div className="space-y-2 text-sm">
              <a href="tel:+917760322345" className="flex items-center gap-2 text-white/50 hover:text-purple-400 transition-colors">
                <span>📞</span>
                <span>+91 7760322345</span>
              </a>
              <a href="mailto:support@techboom.com" className="flex items-center gap-2 text-white/50 hover:text-purple-400 transition-colors">
                <span>✉️</span>
                <span>support@techboom.com</span>
              </a>
            </div>
            <div className="flex gap-3 mt-6">
              {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-purple-500/50 transition-colors text-xs font-medium"
                  aria-label={social}
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-purple-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">© 2024 Techboom. All rights reserved.</p>
          <p className="text-white/40 text-sm">
            Made with <span className="text-purple-400">♥</span> in India
          </p>
        </div>
      </div>
    </footer>
  )
}
