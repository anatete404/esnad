'use client'

import Link from 'next/link'
import { Bell, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Notification = {
  id: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
}

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  const load = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const d = await res.json()
        setItems(d.notifications)
        setUnread(d.unreadCount)
      }
    } catch {}
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const markAll = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    load()
  }

  const markOne = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 rounded-full bg-black/[0.06] hover:bg-black/10 grid place-items-center transition"
      >
        <Bell className="w-4 h-4 text-black/70" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#c89a2c] text-black text-[10px] font-extrabold grid place-items-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-12 w-[340px] max-w-[90vw] bg-white rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden z-50">
          <div className="p-3 border-b border-black/5 flex items-center justify-between">
            <div className="font-extrabold text-[13px]">الإشعارات</div>
            {unread > 0 && (
              <button onClick={markAll} className="text-[11px] font-bold text-[#0d7a3e]">
                قراءة الكل
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center py-10 text-[12px] text-black/40">
                لا توجد إشعارات
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markOne(n.id)}
                  className={`p-3 border-b border-black/5 last:border-0 cursor-pointer hover:bg-[#f9fbf9] transition ${
                    !n.isRead ? 'bg-[#f0faf4]' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#0d7a3e] shrink-0 mt-1.5" />}
                    <div className="flex-1 min-w-0">
                      <div className={`text-[12px] ${!n.isRead ? 'font-extrabold' : 'font-bold text-black/75'}`}>
                        {n.title}
                      </div>
                      <div className="text-[11px] text-black/60 mt-0.5 leading-6">{n.body}</div>
                      <div className="text-[10px] text-black/40 mt-1">
                        {new Date(n.createdAt).toLocaleString('ar-EG')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PublicHeader({ userName }: { userName?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0d7a3e] text-[18px] font-black text-white">
            ح
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-extrabold tracking-tight">
              منصة إسناد للتنمية الزراعية
            </div>
            <div className="text-[10px] font-semibold text-black/60">
              منظومة تقنين الأراضي
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 text-[13px] font-semibold md:flex">
          <Link href="/" className="rounded-full px-3 py-2 transition hover:bg-black/5">
            الرئيسية
          </Link>
          <Link href="/track" className="rounded-full px-3 py-2 transition hover:bg-black/5">
            متابعة طلب
          </Link>
          <Link href="/help" className="rounded-full px-3 py-2 transition hover:bg-black/5">
            مركز المساعدة
          </Link>
          <Link href="/guide" className="rounded-full px-3 py-2 transition hover:bg-black/5">
            دليل المستخدم
          </Link>
          <Link href="/whats-new" className="rounded-full px-3 py-2 transition hover:bg-black/5">
            آخر التحديثات
          </Link>
          {userName && (
            <Link href="/dashboard" className="rounded-full px-3 py-2 transition hover:bg-black/5">
              ملفاتي
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {userName && <NotificationBell />}

          {userName ? (
            <>
              <span className="hidden text-[12px] font-bold text-black/60 md:inline">
                {userName}
              </span>
              <Link
                href="/dashboard"
                className="hidden md:flex h-9 items-center rounded-full bg-[#0d7a3e] px-4 text-[13px] font-bold text-white"
              >
                ملفاتي
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:flex h-9 items-center rounded-full border border-black/10 px-4 text-[13px] font-bold"
              >
                دخول
              </Link>
              <Link
                href="/register"
                className="flex h-9 items-center rounded-full bg-[#0d7a3e] px-4 text-[13px] font-bold text-white shadow-sm"
              >
                حساب جديد
              </Link>
            </>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden w-9 h-9 rounded-full bg-black/[0.06] grid place-items-center"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-black/5 bg-white px-4 py-3 space-y-1">
          <Link href="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-black/5 font-semibold text-[14px]">
            الرئيسية
          </Link>
          <Link href="/track" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-black/5 font-semibold text-[14px]">
            متابعة طلب
          </Link>
          <Link href="/help" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-black/5 font-semibold text-[14px]">
            مركز المساعدة
          </Link>
          <Link href="/guide" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-black/5 font-semibold text-[14px]">
            دليل المستخدم
          </Link>
          <Link href="/whats-new" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-black/5 font-semibold text-[14px]">
            آخر التحديثات
          </Link>
          {userName ? (
            <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-black/5 font-semibold text-[14px]">
              ملفاتي
            </Link>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-black/5 font-semibold text-[14px]">
                دخول
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-black/5 font-semibold text-[14px]">
                حساب جديد
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
