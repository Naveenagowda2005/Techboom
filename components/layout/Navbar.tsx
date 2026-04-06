'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/app', label: 'App Dev' },
  { href: '/web', label: 'Web Dev' },
  { href: '/gst', label: 'GST' },
  { href: '/ecommerce', label: 'E-Commerce' },
  { href: '/influencer', label: 'Influencer' },
  { href: '/store', label: 'Store' },
]

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    // Check if user is logged in
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.data)
        }
      } catch {
        // User not logged in
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      setUser(null)
      router.push('/')
    } catch {
      // Handle error
    }
  }

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-[#0f0a1e]/95 backdrop-blur-md border-b border-white/10 shadow-lg' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">TB</span>
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
              Techboom
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-purple-400 bg-purple-500/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/90 hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a1333] border border-white/10 rounded-xl shadow-xl py-2">
                    <Link
                      href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        handleLogout()
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary text-sm px-5 py-2.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0f0a1e]/98 backdrop-blur-md border-b border-white/10">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-purple-400 bg-purple-500/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                    onClick={() => setMobileOpen(false)}
                    className="btn-outline text-center text-sm py-2.5"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      handleLogout()
                    }}
                    className="btn-outline text-center text-sm py-2.5 text-red-400"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-outline text-center text-sm py-2.5">
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="btn-primary text-center text-sm py-2.5">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
