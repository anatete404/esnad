'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, LogOut } from 'lucide-react'

export default function CitizenLogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/citizen/logout', { method: 'POST' })
    } catch {
      // ignore network errors, still redirect
    } finally {
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="rounded-full border border-black/10 px-4 py-2 text-[12px] font-bold text-black disabled:opacity-50 inline-flex items-center gap-1.5"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
      خروج
    </button>
  )
}