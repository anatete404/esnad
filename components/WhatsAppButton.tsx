'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

const WHATSAPP_NUMBER = '201113999179'
const DEFAULT_MESSAGE = 'مرحباً، لدي استفسار عن منصة إسناد للتنمية الزراعية'

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`

  return (
    <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2">
      {open && (
        <div className="rounded-[16px] bg-white border border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.15)] p-4 w-[260px] animate-scale-in">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="font-extrabold text-[13px]">تواصل عبر واتساب</div>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-full bg-black/5 grid place-items-center"
              aria-label="إغلاق"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-black/60 leading-6 mb-3">
            مرحباً 👋 هل تحتاج مساعدة؟ تواصل معنا مباشرة على واتساب.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-10 rounded-full bg-[#25D366] hover:bg-[#1ea952] text-white font-bold text-[12px] text-center leading-10 transition"
          >
            ابدأ المحادثة
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ea952] text-white shadow-[0_8px_24px_rgba(37,211,102,0.4)] grid place-items-center transition-all btn-press ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="تواصل عبر واتساب"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  )
}
