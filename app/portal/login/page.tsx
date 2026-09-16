'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

export default function StaffLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'خطأ في الدخول')
        return
      }

      router.push('/portal')
      router.refresh()
    } catch {
      setError('تعذّر الاتصال بالسيرفر')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7faf7] px-4 py-12">
      <div className="mx-auto max-w-md rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.06)] md:p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0d7a3e]/10">
            <ShieldCheck className="h-6 w-6 text-[#0d7a3e]" />
          </div>
          <div>
            <div className="text-[18px] font-extrabold text-[#0a5c2f]">بوابة الموظفين</div>
            <div className="text-[12px] text-black/60">نظام إدارة الطلبات والحوكمة</div>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[12px] font-semibold text-red-700">
              {error}
            </div>
          )}

          <label className="block">
            <div className="mb-1.5 text-[11px] font-bold text-black/70">البريد الإلكتروني</div>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <div className="mb-1.5 text-[11px] font-bold text-black/70">كلمة المرور</div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0d7a3e] text-[14px] font-bold text-white disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="mt-6 text-center text-[12px] text-black/60">
          <Link href="/login" className="font-bold text-[#0d7a3e]">
            العودة إلى واجهة المواطن
          </Link>
        </div>
      </div>
    </div>
  )
}
