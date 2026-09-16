'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, Ticket } from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'

export default function TrackPage() {
  const router = useRouter()
  const [trackingNumber, setTrackingNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const code = trackingNumber.trim().toUpperCase()
    if (code.length < 5) {
      setError('أدخل رقم تتبع صحيح')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(code)}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'لا يوجد طلب بهذا الرقم')
        return
      }
      router.push(`/track/${encodeURIComponent(code)}`)
    } catch {
      setError('تعذّر الاتصال بالسيرفر')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PublicHeader />
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="rounded-[24px] bg-white border border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.05)] p-6 md:p-8">
          <div className="w-14 h-14 rounded-full bg-[#0d7a3e]/10 grid place-items-center">
            <Search className="w-6 h-6 text-[#0d7a3e]" />
          </div>

          <h1 className="mt-4 text-[24px] font-extrabold">متابعة الطلب</h1>
          <p className="mt-1 text-[13px] text-black/60 leading-7">
            أدخل رقم التتبع الخاص بطلبك لمعرفة حالته الحالية ومراحل تقدمه
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] font-semibold p-3">
                {error}
              </div>
            )}

            <label className="block">
              <div className="text-[11px] font-bold text-black/70 mb-1.5">
                رقم التتبع
              </div>
              <div className="relative">
                <Ticket className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-black/30" />
                <input
                  className="input pr-10 font-mono tracking-wider"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="EGY-TQN-2026-XXXXXX"
                  dir="ltr"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-[#0d7a3e] text-white font-bold text-[14px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> جارٍ البحث...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" /> ابحث عن الطلب
                </>
              )}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-[#f0faf4] border border-[#0d7a3e]/20 p-3 text-[11px] text-[#0d5a2e] leading-6">
            💡 رقم التتبع بيوصلك في رسالة تأكيد عند تقديم الطلب. تقدر تلاقيه كمان في لوحة "ملفاتي" بعد تسجيل الدخول.
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  )
}
