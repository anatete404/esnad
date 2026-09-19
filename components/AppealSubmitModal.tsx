'use client'

import { useState } from 'react'
import { AlertCircle, Loader2, Send, X } from 'lucide-react'

type Props = {
  applicationId: string
  onClose: () => void
  onSubmitted: () => void
}

export default function AppealSubmitModal({ applicationId, onClose, onSubmitted }: Props) {
  const [form, setForm] = useState({ reason: '', details: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.reason.trim().length < 10) {
      setError('السبب قصير جداً — 10 أحرف على الأقل')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/citizen/applications/${applicationId}/appeal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: form.reason.trim(), details: form.details.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'فشل التقديم')
        return
      }
      onSubmitted()
    } catch {
      setError('تعذّر الاتصال')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="p-5 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white z-10">
          <div><div className="font-extrabold text-[16px]">تقديم تظلم</div><div className="text-[11px] text-black/55 mt-0.5">سيراجع موظف مختص تظلمك ويصدر القرار</div></div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/5 grid place-items-center"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {error && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] font-semibold p-3 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}</div>}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] leading-6 text-amber-900">⚠️ ملاحظة: التظلم متاح فقط للطلبات المرفوضة. اكتب سبب التظلم بوضوح.</div>
          <label className="block"><div className="text-[11px] font-bold text-black/70 mb-1.5">سبب التظلم * (10-200 حرف)</div><input className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="مثال: لم يتم الأخذ في الاعتبار مستندات إضافية" maxLength={200} required autoFocus /><div className="text-[10px] text-black/40 mt-1">{form.reason.length}/200</div></label>
          <label className="block"><div className="text-[11px] font-bold text-black/70 mb-1.5">تفاصيل إضافية (اختياري)</div><textarea className="input" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="اذكر كل التفاصيل التي قد تدعم تظلمك..." maxLength={2000} rows={5} /><div className="text-[10px] text-black/40 mt-1">{form.details.length}/2000</div></label>
          <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="flex-1 h-11 rounded-full border border-black/10 font-bold text-[13px]">إلغاء</button><button type="submit" disabled={saving} className="flex-1 h-11 rounded-full bg-[#0d7a3e] text-white font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" />تقديم التظلم</>}</button></div>
        </form>
      </div>
    </div>
  )
}
