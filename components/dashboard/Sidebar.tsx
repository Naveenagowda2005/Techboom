'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const customerNavItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/services', label: 'Book Services', icon: '⚡' },
  { href: '/dashboard/orders', label: 'My Orders', icon: '📦' },
  { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
]

const userNavItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/referrals', label: 'Referrals', icon: '🔗' },
  { href: '/dashboard/wallet', label: 'Earnings', icon: '💰' },
  { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
]

const adminNavItems = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/services', label: 'Services', icon: '⚡' },
  { href: '/admin/products', label: 'Products', icon: '🛍️' },
  { href: '/admin/referrals', label: 'Referrals', icon: '🔗' },
  { href: '/admin/payments', label: 'Payments', icon: '💳' },
  { href: '/admin/campaigns', label: 'Campaigns', icon: '🎯' },
]

interface SidebarProps {
  role?: string
  userName?: string
  onClose?: () => void
}

export default function Sidebar({ role = 'CUSTOMER', userName = 'User', onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  
  // Select nav items based on role
  const navItems = 
    role === 'ADMIN' ? adminNavItems :
    role === 'USER' ? userNavItems :
    customerNavItems

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0618] border-r border-white/10 w-64">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-yellow-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">TB</span>
          </div>
          <span className="text-lg font-black bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
            Techboom
          </span>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {userName[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{userName}</div>
            <div className="text-xs text-purple-400">{role}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              pathname === item.href
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </div>
  )
}
