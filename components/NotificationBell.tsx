'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'

type Notification = {
  id: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
  applicationId: string | null
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setItems(data.notifications)
        setUnread(data.unreadCount)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
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
        className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center transition"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#c89a2c] text-black text-[10px] font-extrabold grid place-items-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-12 w-[340px] max-w-[90vw] bg-white rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden z-50">
          <div className="p-3 border-b border-black/5 flex items-center justify-between">
            <div className="font-extrabold text-[13px] text-black">الإشعارات</div>
            {unread > 0 && (
              <button
                onClick={markAll}
                className="text-[11px] font-bold text-[#0d7a3e] flex items-center gap-1"
              >
                <CheckCheck className="w-3 h-3" />
                قراءة الكل
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-[#0d7a3e]" />
              </div>
            ) : items.length === 0 ? (
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
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#0d7a3e] shrink-0 mt-1.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`text-[12px] ${!n.isRead ? 'font-extrabold text-black' : 'font-bold text-black/75'}`}>
                        {n.title}
                      </div>
                      <div className="text-[11px] text-black/60 mt-0.5 leading-6">
                        {n.body}
                      </div>
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
