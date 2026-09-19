'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Activity,
  Bell,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquareWarning,
  Shield,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import CommandPalette from '@/components/CommandPalette'
import NotificationBell from '@/components/NotificationBell'

type StaffUser = {
  id: string
  fullName: string
  email: string
  roleKey: string
  branchId: string | null
  permissions: string[]
}

const MENU = [
  { href: '/portal', label: 'لوحة التحكم', icon: Home, perm: null },
  { href: '/portal/my-activity', label: 'نشاطي', icon: Activity, perm: null },
  { href: '/portal/applications', label: 'الطلبات', icon: FileText, perm: 'applications.view' },
  { href: '/portal/users', label: 'المستخدمون', icon: Users, perm: 'users.manage' },
  { href: '/portal/appeals', label: 'التظلمات', icon: MessageSquareWarning, perm: 'appeals.view' },
  { href: '/portal/reports', label: 'التقارير', icon: TrendingUp, perm: 'reports.view' },
  { href: '/portal/audit', label: 'سجل التدقيق', icon: Shield, perm: 'audit.view' },
]

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<StaffUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingAppeals, setPendingAppeals] = useState(0)

  useEffect(() => {
    fetch('/api/auth/staff/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null))
  }, [pathname])

  useEffect(() => {
    const fetchPendingAppeals = async () => {
      try {
        const res = await fetch('/api/staff/appeals/stats')
        if (res.ok) {
          const data = await res.json()
          setPendingAppeals(data.pending || 0)
        }
      } catch {}
    }

    fetchPendingAppeals()
    const interval = setInterval(fetchPendingAppeals, 60000)
    return () => clearInterval(interval)
  }, [])

  const logout = async () => {
    await fetch('/api/auth/staff/logout', { method: 'POST' })
    router.push('/portal/login')
    router.refresh()
  }

  // صفحة تسجيل الدخول ما يظهرش فيها الـ layout
  if (pathname === '/portal/login') {
    return <>{children}</>
  }

  const visibleMenu = MENU.filter((m) => {
    if (!m.perm) return true
    return user?.permissions.includes(m.perm)
  })

  return (
    <div className="min-h-screen bg-[#f5f8f5]" dir="rtl">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#0a0f0d] text-white border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-[64px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="lg:hidden w-9 h-9 rounded-full bg-white/10 grid place-items-center"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/portal" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[10px] bg-[#0d7a3e] grid place-items-center text-white font-black text-[16px]">
                ح
              </div>
              <div className="leading-tight hidden sm:block">
                <div className="text-[13px] font-extrabold">بوابة الموظفين</div>
                <div className="text-[10px] text-white/50">منصة إسناد للتنمية الزراعية</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden md:block text-right">
                <div className="text-[12px] font-bold">{user.fullName}</div>
                <div className="text-[10px] text-white/50">{user.email}</div>
              </div>
            )}
            <NotificationBell />
            <button
              onClick={logout}
              className="h-9 px-3 rounded-full bg-white/10 hover:bg-white/20 text-[12px] font-bold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-[64px] right-0 z-30 w-[260px] h-[calc(100vh-64px)] bg-white border-l border-black/5 transition-transform duration-200 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          <nav className="p-4 space-y-1">
            {visibleMenu.map((m) => {
              const active =
                m.href === '/portal'
                  ? pathname === '/portal'
                  : pathname.startsWith(m.href)
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition ${
                    active
                      ? 'bg-[#0d7a3e] text-white'
                      : 'text-black/70 hover:bg-black/5'
                  }`}
                >
                  <m.icon className="w-4 h-4" />
                  {m.href === '/portal/appeals' && pendingAppeals > 0 && (
                    <span className="ms-auto min-w-[20px] h-5 px-1.5 rounded-full bg-[#c89a2c] text-black text-[10px] font-extrabold grid place-items-center">
                      {pendingAppeals > 99 ? '99+' : pendingAppeals}
                    </span>
                  )}
                  {m.label}
                </Link>
              )
            })}
          </nav>

          {user && (
            <div className="absolute bottom-4 right-4 left-4 rounded-xl bg-[#f0faf4] border border-[#0d7a3e]/20 p-3 text-[10px] leading-5">
              <div className="font-bold text-[#0d5a2e]">الدور الحالي</div>
              <div className="mt-1 text-black/60 font-mono">{user.roleKey}</div>
            </div>
          )}
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 top-[64px] bg-black/30 z-20 lg:hidden"
          />
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="max-w-[1400px] mx-auto p-4 md:p-6">{children}</div>
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
