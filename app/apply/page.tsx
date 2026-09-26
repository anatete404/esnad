'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  MapPin,
  FileText,
  CheckCircle2,
  Send,
  Ruler,
  Calendar,
  Droplets,
} from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import DocumentUploader, { type UploadedDoc } from '@/components/DocumentUploader'

const GOVS = [
  'القاهرة','الجيزة','الفيوم','بني سويف','المنيا','أسيوط','سوهاج','قنا',
  'الأقصر','أسوان','الوادي الجديد','مطروح','البحيرة','كفر الشيخ','الدقهلية',
  'الشرقية','المنوفية','الغربية','دمياط','بورسعيد','الإسماعيلية','السويس',
  'شمال سيناء','جنوب سيناء','البحر الأحمر',
]

const ACTIVITIES = ['زراعي', 'مباني', 'استصلاح', 'غير مستغل']
const WATER_SOURCES = ['بئر جوفي', 'ترعة', 'مياه جوفية + ترعة', 'لا يوجد']
const LAND_STATUSES = ['مزروعة بالكامل', 'مزروعة جزئياً', 'مستصلحة غير مزروعة', 'صحراوية']
const HAND_REASONS = ['استصلاح', 'شراء عرفي', 'ميراث', 'وضع يد هادئ']

const STEPS = [
  { n: 1, t: 'بيانات الأرض', icon: MapPin },
  { n: 2, t: 'تفاصيل إضافية', icon: Ruler },
  { n: 3, t: 'رفع المستندات', icon: FileText },
  { n: 4, t: 'المراجعة والإرسال', icon: CheckCircle2 },
]

export default function ApplyPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ trackingNumber: string } | null>(null)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<UploadedDoc[]>([])
  const [createdTrackingNumber, setCreatedTrackingNumber] = useState('')
  const [finalizing, setFinalizing] = useState(false)

  const [form, setForm] = useState({
    gov: '',
    center: '',
    village: '',
    detail: '',
    faddan: '0',
    qirat: '0',
    sahm: '0',
    lat: '',
    lng: '',
    handDate: '',
    handReason: '',
    activity: 'زراعي',
    waterSource: '',
    landStatus: '',
    notes: '',
  })

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const totalFaddan =
    (parseFloat(form.faddan) || 0) +
    (parseFloat(form.qirat) || 0) / 24 +
    (parseFloat(form.sahm) || 0) / 576

  const refreshDocuments = async () => {
    if (!applicationId) return
    try {
      const res = await fetch(`/api/citizen/applications/${applicationId}/documents`)
      if (!res.ok) return
      const data = await res.json()
      setDocuments(data.documents || [])
    } catch {
      setError('تعذّر تحميل المستندات')
    }
  }

  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (!form.gov) return 'المحافظة مطلوبة'
      if (!form.center.trim()) return 'المركز مطلوب'
      if (parseFloat(form.faddan) === 0 && parseFloat(form.qirat) === 0 && parseFloat(form.sahm) === 0) {
        return 'يجب تحديد المساحة'
      }
    }
    if (s === 2) {
      if (!form.handReason) return 'سبب وضع اليد مطلوب'
      if (!form.waterSource) return 'مصدر المياه مطلوب'
    }
    if (s === 3) {
      if (documents.length === 0) return 'يجب رفع مستند واحد على الأقل قبل المتابعة'
    }
    return null
  }

  const nextStep = () => {
    const err = validateStep(step)
    if (err) {
      setError(err)
      return
    }
    setError('')
    if (step === 2) {
      void submit()
      return
    }
    setStep((s) => Math.min(4, s + 1))
  }

  const prevStep = () => {
    setError('')
    setStep((s) => Math.max(1, s - 1))
  }

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/citizen/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gov: form.gov,
          center: form.center,
          village: form.village,
          detail: form.detail,
          faddan: parseFloat(form.faddan) || 0,
          qirat: parseFloat(form.qirat) || 0,
          sahm: parseFloat(form.sahm) || 0,
          lat: form.lat,
          lng: form.lng,
          handDate: form.handDate,
          handReason: form.handReason,
          activity: form.activity,
          waterSource: form.waterSource,
          landStatus: form.landStatus,
          notes: form.notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'حدث خطأ')
        return
      }
      setApplicationId(data.application.id)
      setCreatedTrackingNumber(data.application.trackingNumber)
      setStep(3)
    } catch {
      setError('تعذّر الاتصال بالسيرفر')
    } finally {
      setLoading(false)
    }
  }

  const finalize = async () => {
    if (!applicationId) {
      setError('لم يتم إنشاء الطلب بعد')
      return
    }
    setError('')
    setFinalizing(true)
    try {
      const res = await fetch(`/api/citizen/applications/${applicationId}/finalize`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'حدث خطأ في الإرسال النهائي')
        return
      }
      setSuccess({ trackingNumber: createdTrackingNumber })
    } catch {
      setError('تعذر الاتصال بالسيرفر')
    } finally {
      setFinalizing(false)
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
          <h1 className="mt-5 text-[26px] font-extrabold">تم استلام طلبك بنجاح</h1>
          <div className="mt-3 text-[14px] text-black/60">
            احتفظ برقم التتبع ده عشان تتابع طلبك
          </div>

          <div className="mt-6 rounded-2xl bg-[#0d1a12] text-white p-5 inline-block">
            <div className="text-[11px] opacity-70">رقم التتبع</div>
            <div className="mt-1 text-[24px] font-mono font-extrabold tracking-wider">
              {success.trackingNumber}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-[13px] text-amber-900 text-right leading-7">
            سيتم مراجعة طلبك خلال 72 ساعة. ستصلك رسالة نصية عند تغيّر حالة الطلب.
            القرار النهائي للجهة المختصة.
          </div>

          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link
              href={`/track/${success.trackingNumber}`}
              className="h-11 px-6 rounded-full bg-[#0d7a3e] text-white font-bold text-[13px] flex items-center"
            >
              متابعة الطلب
            </Link>
            <Link
              href="/dashboard"
              className="h-11 px-6 rounded-full border border-black/10 font-bold text-[13px] flex items-center"
            >
              ملفاتي
            </Link>
          </div>
        </div>
        <PublicFooter />
      </>
    )
  }

  return (
    <>
      <PublicHeader />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="rounded-[20px] bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] text-white p-6">
          <div className="text-[11px] opacity-85">خطوة {step} من 4</div>
          <div className="mt-1 text-[22px] font-extrabold">تقديم طلب تقنين وضع يد</div>
          <div className="mt-1 text-[12px] opacity-85">
            جميع الحقول المطلوبة عليها *
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 overflow-x-auto pb-2">
          {STEPS.map((s) => (
            <div key={s.n} className="flex items-center gap-2 shrink-0">
              <div
                className={`w-9 h-9 rounded-full grid place-items-center font-bold text-[12px] border transition ${
                  step >= s.n
                    ? 'bg-[#0d7a3e] text-white border-[#0d7a3e]'
                    : 'bg-white border-black/10 text-black/40'
                }`}
              >
                {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
              </div>
              <div className={`text-[12px] font-bold ${step >= s.n ? 'text-black' : 'text-black/40'}`}>
                {s.t}
              </div>
              {s.n < 4 && (
                <div className={`w-10 h-px mx-2 ${step > s.n ? 'bg-[#0d7a3e]' : 'bg-black/10'}`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] font-semibold p-3">
            {error}
          </div>
        )}

        <div className="mt-6 rounded-[20px] bg-white border border-black/5 shadow-sm p-5 md:p-7">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-[16px] font-extrabold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0d7a3e]" />
                موقع الأرض
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="المحافظة *">
                  <select
                    className="input"
                    value={form.gov}
                    onChange={(e) => update('gov', e.target.value)}
                  >
                    <option value="">اختر المحافظة</option>
                    {GOVS.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </Field>

                <Field label="المركز / المدينة *">
                  <input
                    className="input"
                    value={form.center}
                    onChange={(e) => update('center', e.target.value)}
                    placeholder="مثال: الخانكة"
                  />
                </Field>

                <Field label="القرية / المنطقة">
                  <input
                    className="input"
                    value={form.village}
                    onChange={(e) => update('village', e.target.value)}
                  />
                </Field>

                <Field label="علامة مميزة / وصف الموقع">
                  <input
                    className="input"
                    value={form.detail}
                    onChange={(e) => update('detail', e.target.value)}
                    placeholder="الكيلو 60 طريق..."
                  />
                </Field>
              </div>

              <div className="h-px bg-black/5 my-3" />

              <h2 className="text-[16px] font-extrabold flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[#0d7a3e]" />
                المساحة *
              </h2>

              <div className="grid grid-cols-3 gap-3">
                <Field label="فدان">
                  <input
                    type="number"
                    className="input"
                    value={form.faddan}
                    onChange={(e) => update('faddan', e.target.value)}
                    min={0}
                  />
                </Field>
                <Field label="قيراط (24 = فدان)">
                  <input
                    type="number"
                    className="input"
                    value={form.qirat}
                    onChange={(e) => update('qirat', e.target.value)}
                    min={0}
                    max={23}
                  />
                </Field>
                <Field label="سهم (576 = فدان)">
                  <input
                    type="number"
                    className="input"
                    value={form.sahm}
                    onChange={(e) => update('sahm', e.target.value)}
                    min={0}
                    max={575}
                  />
                </Field>
              </div>

              <div className="rounded-xl bg-[#f0faf4] border border-[#0d7a3e]/20 p-3 text-center">
                <div className="text-[11px] text-black/60">إجمالي المساحة</div>
                <div className="mt-1 text-[20px] font-extrabold text-[#0d7a3e]">
                  {totalFaddan.toFixed(4)} فدان
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-[16px] font-extrabold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0d7a3e]" />
                وضع اليد
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="تاريخ وضع اليد">
                  <input
                    type="date"
                    className="input"
                    value={form.handDate}
                    onChange={(e) => update('handDate', e.target.value)}
                  />
                </Field>

                <Field label="سبب وضع اليد *">
                  <select
                    className="input"
                    value={form.handReason}
                    onChange={(e) => update('handReason', e.target.value)}
                  >
                    <option value="">اختر السبب</option>
                    {HAND_REASONS.map((h) => (
                      <option key={h}>{h}</option>
                    ))}
                  </select>
                </Field>

                <Field label="النشاط الحالي">
                  <select
                    className="input"
                    value={form.activity}
                    onChange={(e) => update('activity', e.target.value)}
                  >
                    {ACTIVITIES.map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </Field>

                <Field label="حالة الأرض">
                  <select
                    className="input"
                    value={form.landStatus}
                    onChange={(e) => update('landStatus', e.target.value)}
                  >
                    <option value="">اختر</option>
                    {LAND_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="h-px bg-black/5 my-3" />

              <h2 className="text-[16px] font-extrabold flex items-center gap-2">
                <Droplets className="w-5 h-5 text-[#0d7a3e]" />
                مصدر المياه
              </h2>

              <Field label="مصدر المياه *">
                <select
                  className="input"
                  value={form.waterSource}
                  onChange={(e) => update('waterSource', e.target.value)}
                >
                  <option value="">اختر المصدر</option>
                  {WATER_SOURCES.map((w) => (
                    <option key={w}>{w}</option>
                  ))}
                </select>
              </Field>

              <div className="h-px bg-black/5 my-3" />

              <h2 className="text-[16px] font-extrabold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0d7a3e]" />
                الإحداثيات (اختياري)
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <Field label="خط العرض">
                  <input
                    className="input"
                    value={form.lat}
                    onChange={(e) => update('lat', e.target.value)}
                    placeholder="29.123456"
                  />
                </Field>
                <Field label="خط الطول">
                  <input
                    className="input"
                    value={form.lng}
                    onChange={(e) => update('lng', e.target.value)}
                    placeholder="30.123456"
                  />
                </Field>
              </div>

              <Field label="ملاحظات إضافية">
                <textarea
                  className="input"
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder="أي معلومات إضافية..."
                />
              </Field>
            </div>
          )}

          {step === 3 && applicationId && (
            <div className="space-y-5">
              <h2 className="text-[16px] font-extrabold flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0d7a3e]" />
                رفع المستندات
              </h2>

              <div className="space-y-3">
                <DocumentUploader
                  applicationId={applicationId}
                  docType="nationalId"
                  label="بطاقة الرقم القومي"
                  hint="الوجه والظهر"
                  documents={documents.filter((doc) => doc.type === 'nationalId')}
                  onChange={refreshDocuments}
                />
                <DocumentUploader
                  applicationId={applicationId}
                  docType="tawkeel"
                  label="التوكيل"
                  documents={documents.filter((doc) => doc.type === 'tawkeel')}
                  onChange={refreshDocuments}
                />
                <DocumentUploader
                  applicationId={applicationId}
                  docType="handProof"
                  label="إثبات وضع اليد"
                  documents={documents.filter((doc) => doc.type === 'handProof')}
                  onChange={refreshDocuments}
                />
                <DocumentUploader
                  applicationId={applicationId}
                  docType="landPhotos"
                  label="صور الأرض"
                  documents={documents.filter((doc) => doc.type === 'landPhotos')}
                  onChange={refreshDocuments}
                />
                <DocumentUploader
                  applicationId={applicationId}
                  docType="receipts"
                  label="إيصالات"
                  documents={documents.filter((doc) => doc.type === 'receipts')}
                  onChange={refreshDocuments}
                />
                <DocumentUploader
                  applicationId={applicationId}
                  docType="other"
                  label="مستندات أخرى"
                  documents={documents.filter((doc) => doc.type === 'other')}
                  onChange={refreshDocuments}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-[16px] font-extrabold flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0d7a3e]" />
                مراجعة البيانات
              </h2>

              <div className="grid md:grid-cols-2 gap-4 text-[13px]">
                <ReviewItem label="المحافظة" value={form.gov} />
                <ReviewItem label="المركز" value={form.center} />
                <ReviewItem label="القرية" value={form.village} />
                <ReviewItem label="وصف الموقع" value={form.detail} />
                <ReviewItem
                  label="المساحة"
                  value={`${totalFaddan.toFixed(4)} فدان (${form.faddan}ف / ${form.qirat}ق / ${form.sahm}س)`}
                />
                <ReviewItem label="سبب وضع اليد" value={form.handReason} />
                <ReviewItem label="النشاط" value={form.activity} />
                <ReviewItem label="مصدر المياه" value={form.waterSource} />
                <ReviewItem label="حالة الأرض" value={form.landStatus} />
                <ReviewItem label="تاريخ وضع اليد" value={form.handDate} />
              </div>

              <div className="rounded-xl bg-[#f0faf4] border border-[#0d7a3e]/20 p-4 text-[12px] leading-7 text-[#0d5a2e]">
                <div className="font-bold mb-1">⚠️ ملاحظات مهمة قبل الإرسال:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>تأكد من صحة البيانات - مش هينفع تعدلها بعد الإرسال</li>
                  <li>هيتم مراجعة الطلب من فريق الفحص</li>
                  <li>القرار النهائي للجهة المختصة</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-7 flex justify-between gap-3">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="h-11 px-6 rounded-full border border-black/10 font-bold text-[13px] flex items-center gap-2 disabled:opacity-30"
            >
              <ArrowRight className="w-4 h-4" />
              السابق
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="h-11 px-7 rounded-full bg-[#0d7a3e] text-white font-bold text-[13px] flex items-center gap-2"
              >
                التالي
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void finalize()}
                disabled={finalizing}
                className="h-11 px-7 rounded-full bg-[#c89a2c] text-black font-bold text-[13px] flex items-center gap-2 disabled:opacity-50"
              >
                {finalizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> جارٍ الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> إنهاء والإرسال
                  </>
                )}
              </button>
            )}
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

function ReviewItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl bg-[#f9fbf9] border border-black/5 p-3">
      <div className="text-[10px] text-black/50 font-bold">{label}</div>
      <div className="mt-1 text-[13px] font-bold text-black/85">
        {value?.trim() || <span className="text-black/30">—</span>}
      </div>
    </div>
  )
}
