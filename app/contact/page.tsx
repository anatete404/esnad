'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    trackingNumber: '',
    subject: '',
    message: '',
  })

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'حدث خطأ')
        return
      }
      setSuccess(true)
    } catch {
      setError('تعذّر الاتصال بالسيرفر')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <PublicHeader />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-[#0d7a3e]/10 mx-auto grid place-items-center">
            <CheckCircle2 className="w-10 h-10 text-[#0d7a3e]" />
          </div>
          <h1 className="mt-5 text-[26px] font-extrabold">تم استلام رسالتك</h1>
          <p className="mt-3 text-[14px] text-black/60 leading-7">
            شكرًا لتواصلك معنا. سيتم مراجعة رسالتك والتواصل معك في أقرب وقت ممكن.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/"
              className="h-11 px-6 rounded-full bg-[#0d7a3e] text-white font-bold text-[13px] flex items-center"
            >
              العودة للرئيسية
            </Link>
            <button
              onClick={() => {
                setSuccess(false)
                setForm({
                  fullName: '',
                  phone: '',
                  email: '',
                  trackingNumber: '',
                  subject: '',
                  message: '',
                })
              }}
              className="h-11 px-6 rounded-full border border-black/10 font-bold text-[13px]"
            >
              إرسال رسالة أخرى
            </button>
          </div>
        </div>
        <PublicFooter />
      </>
    )
  }

  return (
    <>
      <PublicHeader />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/5 shadow-sm text-[11px] font-bold">
            <Mail className="w-3.5 h-3.5 text-[#0d7a3e]" />
            <span>تواصل معنا</span>
          </div>
          <h1 className="mt-4 text-[26px] md:text-[32px] font-extrabold">
            عندك استفسار؟ نحن هنا
          </h1>
          <p className="mt-3 text-[14px] text-black/60 leading-7">
            اكتب رسالتك وسيتم التواصل معك من الفريق المختص في أقرب وقت
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="rounded-[24px] bg-white border border-black/5 p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] font-semibold p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="الاسم الكامل *">
                  <input
                    className="input"
                    value={form.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                    placeholder="حسن حسن علي"
                    required
                  />
                </Field>
                <Field label="رقم الهاتف *">
                  <input
                    className="input"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="01xxxxxxxxx"
                    required
                  />
                </Field>
                <Field label="البريد الإلكتروني (اختياري)">
                  <input
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                  />
                </Field>
                <Field label="رقم التتبع (اختياري)">
                  <input
                    className="input font-mono"
                    value={form.trackingNumber}
                    onChange={(e) => update('trackingNumber', e.target.value)}
                    placeholder="EGY-TQN-2026-XXXX"
                    dir="ltr"
                  />
                </Field>
              </div>

              <Field label="موضوع الرسالة *">
                <input
                  className="input"
                  value={form.subject}
                  onChange={(e) => update('subject', e.target.value)}
                  placeholder="مثال: استفسار عن حالة طلب"
                  required
                />
              </Field>

              <Field label="نص الرسالة * (20 حرف على الأقل)">
                <textarea
                  className="input"
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  placeholder="اكتب تفاصيل استفسارك هنا..."
                  maxLength={2000}
                  rows={6}
                  required
                />
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#0d7a3e] hover:bg-[#0a5c2f] text-white font-bold text-[14px] flex items-center justify-center gap-2 transition disabled:opacity-50 btn-press"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> جارٍ الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> إرسال الرسالة
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-[20px] bg-white border border-black/5 p-5">
              <h3 className="font-extrabold text-[14px] mb-4">معلومات التواصل</h3>
              <div className="space-y-3 text-[13px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#0d7a3e]/10 grid place-items-center shrink-0">
                    <Phone className="w-4 h-4 text-[#0d7a3e]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-black/50 font-bold">الهاتف</div>
                    <a href="tel:01113999179" className="font-bold hover:text-[#0d7a3e]" dir="ltr">
                      01113999179
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#0d7a3e]/10 grid place-items-center shrink-0">
                    <Mail className="w-4 h-4 text-[#0d7a3e]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-black/50 font-bold">البريد الإلكتروني</div>
                    <a
                      href="mailto:Elhassan22003@gmail.com"
                      className="font-bold hover:text-[#0d7a3e] text-[11px]"
                    >
                      Elhassan22003@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[10px] bg-[#0d7a3e]/10 grid place-items-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#0d7a3e]" />
                  </div>
                  <div>
                    <div className="text-[10px] text-black/50 font-bold">الموقع</div>
                    <div className="font-bold">جمهورية مصر العربية</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] text-white p-5">
              <h3 className="font-extrabold text-[14px] mb-2">مواعيد العمل</h3>
              <div className="space-y-1.5 text-[12px]">
                <div className="flex justify-between">
                  <span className="opacity-85">الأحد - الخميس</span>
                  <span className="font-bold">9:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-85">الجمعة - السبت</span>
                  <span className="font-bold">مغلق</span>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-white/15 p-3 text-[11px] leading-6">
                📩 نرد على الرسائل خلال 24-48 ساعة
              </div>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] font-bold text-black/70 mb-1.5">{label}</div>
      {children}
    </label>
  )
}
