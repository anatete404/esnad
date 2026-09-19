'use client'

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowRightLeft,
  Loader2,
  Send,
  User,
  X,
} from 'lucide-react'

type Staff = {
  id: string
  fullName: string
  role: { nameAr: string; key: string }
  isActive: boolean
}

type Props = {
  applicationId: string
  currentAssigneeId: string | null
  onClose: () => void
  onSuccess: () => void
}

export default function HandoverModal({
  applicationId,
  currentAssigneeId,
  onClose,
  onSuccess,
}: Props) {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loadingStaff, setLoadingStaff] = useState(true)
  const [pickedId, setPickedId] = useState(currentAssigneeId || '')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/staff/users')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.users) {
          const active = d.users.filter(
            (u: Staff) =>
              u.isActive && u.role.key !== 'admin' && u.role.key !== 'authority_viewer',
          )
          setStaff(active)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStaff(false))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (notes.trim().length < 5) {
      setError('الملاحظات قصيرة جداً — 5 أحرف على الأقل')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/staff/applications/${applicationId}/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newAssigneeId: pickedId || null,
          notes: notes.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'فشلت العملية')
        return
      }
      onSuccess()
    } catch {
      setError('تعذّر الاتصال')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 modal-overlay">
      <div className="bg-white rounded-[20px] w-full max-w-md max-h-[90vh] overflow-auto modal-content">
        <div className="p-5 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-[10px] bg-[#0d7a3e]/10 grid place-items-center">
              <ArrowRightLeft className="w-4 h-4 text-[#0d7a3e]" />
            </div>
            <div>
              <div className="font-extrabold text-[15px]">تسليم المهمة</div>
              <div className="text-[10px] text-black/50">نقل الطلب لموظف آخر</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 grid place-items-center hover:bg-black/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] font-semibold p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <label className="block">
            <div className="text-[11px] font-bold text-black/70 mb-1.5 flex items-center gap-1.5">
              <User className="w-3 h-3" />
              الموظف الجديد
            </div>
            {loadingStaff ? (
              <div className="h-11 rounded-xl bg-black/5 grid place-items-center">
                <Loader2 className="w-4 h-4 animate-spin text-black/30" />
              </div>
            ) : (
              <select
                value={pickedId}
                onChange={(e) => setPickedId(e.target.value)}
                className="input"
              >
                <option value="">— إلغاء الإسناد (بدون موظف) —</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id} disabled={s.id === currentAssigneeId}>
                    {s.fullName} ({s.role.nameAr})
                    {s.id === currentAssigneeId ? ' — الحالي' : ''}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="block">
            <div className="text-[11px] font-bold text-black/70 mb-1.5">ملاحظات التسليم *</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اذكر سبب التسليم، أي معلومة مهمة للموظف الجديد، المرحلة الحالية، الخطوة التالية..."
              maxLength={500}
              rows={4}
              className="input"
              required
            />
            <div className="text-[10px] text-black/40 mt-1 text-left">{notes.length}/500</div>
          </label>

          <div className="rounded-xl bg-[#f0faf4] border border-[#0d7a3e]/20 p-3 text-[11px] leading-6 text-[#0d5a2e]">
            سيتم إرسال إشعار للموظف الجديد، وسيظهر الطلب في قائمة مهامه.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full border border-black/10 font-bold text-[13px]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-11 rounded-full bg-[#0d7a3e] hover:bg-[#0a5c2f] text-white font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-50 btn-press"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جارٍ التسليم...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  تسليم
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
