'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear everything
    localStorage.clear()
    
    // Clear cookies
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    // Call logout API
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
      // Redirect to home after 1 second
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0a1e]">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white text-lg">Logging out...</p>
        <p className="text-white/50 text-sm mt-2">Please wait</p>
      </div>
    </div>
  )
}
