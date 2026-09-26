'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import { isValidEgyptianNationalId } from '@/lib/egyptianNationalId'

const GOVS = [
  'القاهرة', 'الجيزة', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط',
  'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'الوادي الجديد', 'مطروح',
  'البحيرة', 'كفر الشيخ', 'الدقهلية', 'الشرقية', 'المنوفية',
  'الغربية', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس',
  'شمال سيناء', 'جنوب سيناء', 'البحر الأحمر',
]

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    nationalId: '',
    phone: '',
    phone2: '',
    email: '',
    password: '',
    confirmPassword: '',
    gov: '',
    center: '',
    village: '',
    address: '',
    capacity: 'مالك',
  })
  const [acceptTerms, setAcceptTerms] = useState(false)

  const update = (key: string, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('كلمتا السر غير متطابقتين')
      return
    }

    if (!isValidEgyptianNationalId(form.nationalId)) {
      setError('الرقم القومي غير صحيح (تحقق من التاريخ والمحافظة)')
      return
    }

    if (!acceptTerms) {
      setError('يجب الموافقة على الشروط والأحكام')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/citizen/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, acceptTerms }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'حدث خطأ')
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
      <div className="mx-auto max-w-[720px] px-4 py-10 md:px-6 md:py-14">
        <div className="overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
          <div className="bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] p-6 text-white md:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-white/15">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[18px] font-extrabold">إنشاء حساب جديد</div>
                <div className="text-[12px] opacity-85">دقيقة واحدة وتقدر تقدم طلبك</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6 md:p-8">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[13px] font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="الاسم رباعي *">
                <input
                  className="input"
                  value={form.fullName}
                  onChange={(event) => update('fullName', event.target.value)}
                  placeholder="حسن حسن علي محمد"
                  required
                />
              </Field>

              <Field label="الرقم القومي *">
                <input
                  className="input tracking-widest"
                  value={form.nationalId}
                  onChange={(event) =>
                    update('nationalId', event.target.value.replace(/\D/g, '').slice(0, 14))
                  }
                  placeholder="29901011234567"
                  required
                />
              </Field>

              <Field label="رقم الهاتف *">
                <input
                  className="input"
                  value={form.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  placeholder="01xxxxxxxxx"
                  required
                />
              </Field>

              <Field label="رقم احتياطي">
                <input
                  className="input"
                  value={form.phone2}
                  onChange={(event) => update('phone2', event.target.value)}
                />
              </Field>

              <Field label="البريد الإلكتروني *">
                <input
                  type="email"
                  className="input"
                  value={form.email}
                  onChange={(event) => update('email', event.target.value)}
                  placeholder="example@email.com"
                  required
                />
              </Field>

              <Field label="الصفة">
                <select
                  className="input"
                  value={form.capacity}
                  onChange={(event) => update('capacity', event.target.value)}
                >
                  <option>مالك</option>
                  <option>وكيل</option>
                  <option>وارث</option>
                </select>
              </Field>

              <Field label="كلمة السر *">
                <input
                  type="password"
                  className="input"
                  value={form.password}
                  onChange={(event) => update('password', event.target.value)}
                  minLength={8}
                  required
                />
              </Field>

              <Field label="تأكيد كلمة السر *">
                <input
                  type="password"
                  className="input"
                  value={form.confirmPassword}
                  onChange={(event) => update('confirmPassword', event.target.value)}
                  minLength={8}
                  required
                />
              </Field>

              <Field label="المحافظة *">
                <select
                  className="input"
                  value={form.gov}
                  onChange={(event) => update('gov', event.target.value)}
                  required
                >
                  <option value="">اختر</option>
                  {GOVS.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="المركز">
                <input
                  className="input"
                  value={form.center}
                  onChange={(event) => update('center', event.target.value)}
                />
              </Field>

              <Field label="القرية">
                <input
                  className="input"
                  value={form.village}
                  onChange={(event) => update('village', event.target.value)}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="العنوان التفصيلي">
                  <input
                    className="input"
                    value={form.address}
                    onChange={(event) => update('address', event.target.value)}
                  />
                </Field>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer select-none rounded-xl bg-[#f9fbf9] border border-black/5 p-3">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#0d7a3e]"
              />
              <span className="text-[12px] text-black/70 leading-6">
                أوافق على{' '}
                <Link href="/legal/terms" target="_blank" className="font-bold text-[#0d7a3e] hover:underline">
                  الشروط والأحكام
                </Link>{' '}
                و{' '}
                <Link href="/legal/privacy" target="_blank" className="font-bold text-[#0d7a3e] hover:underline">
                  سياسة الخصوصية
                </Link>
              </span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0d7a3e] text-[14px] font-bold text-white disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> جارٍ التسجيل...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> إنشاء الحساب
                </>
              )}
            </button>

            <div className="text-center text-[12px] text-black/60">
              عندك حساب بالفعل؟{' '}
              <Link href="/login" className="font-bold text-[#0d7a3e] hover:underline">
                سجّل الدخول
              </Link>
            </div>
          </form>
        </div>
      </div>
      <PublicFooter />
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[11px] font-bold text-black/70">{label}</div>
      {children}
    </label>
  )
}
