'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, LogIn } from 'lucide-react'
import { useState } from 'react'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [password, setPassword] = useState('')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/citizen/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'خطأ')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('تعذّر الاتصال بالسيرفر')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PublicHeader />
      <div className="mx-auto max-w-110 px-4 py-12 md:px-6 md:py-20">
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.05)] md:p-8">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[#0d7a3e]/10">
            <LogIn className="h-6 w-6 text-[#0d7a3e]" />
          </div>
          <h1 className="mt-4 text-[22px] font-extrabold">تسجيل الدخول</h1>
          <p className="mt-1 text-[12px] text-black/60">ادخل بالرقم القومي وكلمة السر</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] font-semibold text-red-700">
                {error}
              </div>
            )}

            <label className="block">
              <div className="mb-1.5 text-[11px] font-bold text-black/70">الرقم القومي</div>
              <input
                className="input tracking-widest"
                value={nationalId}
                onChange={(event) =>
                  setNationalId(event.target.value.replace(/\D/g, '').slice(0, 14))
                }
                required
              />
            </label>

            <label className="block">
              <div className="mb-1.5 text-[11px] font-bold text-black/70">كلمة السر</div>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0d7a3e] text-[14px] font-bold text-white disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'دخول'}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-[12px] text-black/60">
            <div>
              معندكش حساب؟{' '}
              <Link href="/register" className="font-bold text-[#0d7a3e]">
                سجّل الآن
              </Link>
            </div>
            <div>
              <Link href="/portal/login" className="text-black/40 hover:text-black">
                دخول الموظفين ←
              </Link>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  )
}
