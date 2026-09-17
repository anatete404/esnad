'use client'

import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

export type Payment = {
  id: string
  type: string
  amount: number
  receiptNumber: string | null
  receiptImageUrl: string | null
  paidAt: string | Date | null
  notes: string | null
}

const PAYMENT_TYPES: Record<string, string> = {
  inspection: 'رسوم الفحص',
  survey: 'رسوم المعاينة',
  pricing: 'رسوم التسعير',
  other: 'أخرى',
}

const MAX_FILE_SIZE = 4 * 1024 * 1024

type Props = {
  applicationId: string
  initialPayments: Payment[]
  canEdit: boolean
}

export default function PaymentsManager({
  applicationId,
  initialPayments,
  canEdit,
}: Props) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Payment | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const refresh = async () => {
    try {
      const res = await fetch(
        `/api/staff/applications/${applicationId}/payments`
      )
      if (res.ok) {
        const data = await res.json()
        setPayments(data.payments)
      }
    } catch {
      // ignore
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذه الدفعة؟')) return
    setActionLoading(id)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(
        `/api/staff/applications/${applicationId}/payments/${id}`,
        { method: 'DELETE' }
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'فشل الحذف')
        return
      }
      setSuccess('تم حذف الدفعة')
      await refresh()
    } catch {
      setError('تعذّر الاتصال')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReceiptUpload = async (paymentId: string, file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setError('حجم الملف يتجاوز 4 ميجا')
      return
    }
    setActionLoading(`upload-${paymentId}`)
    setError('')
    setSuccess('')
    try {
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch(
        `/api/staff/applications/${applicationId}/payments/${paymentId}/receipt-image`,
        { method: 'POST', body: fd }
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'فشل رفع الصورة')
        return
      }
      setSuccess('تم رفع صورة الإيصال')
      await refresh()
    } catch {
      setError('تعذّر الاتصال')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="rounded-[20px] overflow-hidden border border-black/5 bg-white shadow-sm">
      <div className="bg-[#0d7a3e] px-5 py-3.5 flex items-center justify-between">
        <h3 className="text-white text-[15px] md:text-[16px] font-extrabold">
          رسوم الطلب
        </h3>
        {canEdit && (
          <button
            onClick={() => {
              setEditing(null)
              setShowModal(true)
            }}
            className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة دفعة
          </button>
        )}
      </div>

      {error && (
        <div className="m-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] font-semibold p-3 flex items-start justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </span>
          <button onClick={() => setError('')} className="text-red-500 font-bold">×</button>
        </div>
      )}
      {success && (
        <div className="m-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-[12px] font-semibold p-3 flex items-start justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            {success}
          </span>
          <button onClick={() => setSuccess('')} className="text-green-500 font-bold">×</button>
        </div>
      )}

      <div className="divide-y divide-black/[0.06]">
        {payments.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="w-8 h-8 mx-auto text-black/20" />
            <div className="mt-2 text-[12px] text-black/50 font-bold">
              لا توجد رسوم مسجّلة
            </div>
          </div>
        ) : (
          payments.map((p) => (
            <div key={p.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-[#0d7a3e]/10 text-[#0d7a3e] text-[11px] font-bold">
                      {PAYMENT_TYPES[p.type] || p.type}
                    </span>
                    <span className="text-[14px] font-extrabold">
                      {p.amount.toLocaleString('ar-EG')} ج.م
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-black/45">رقم الإيصال: </span>
                      <span className="font-mono font-bold">{p.receiptNumber || '—'}</span>
                    </div>
                    <div>
                      <span className="text-black/45">تاريخ الدفع: </span>
                      <span className="font-bold">
                        {p.paidAt ? new Date(p.paidAt).toLocaleDateString('ar-EG') : '—'}
                      </span>
                    </div>
                  </div>

                  {p.notes && (
                    <div className="mt-1 text-[11px] text-black/55">{p.notes}</div>
                  )}

                  {p.receiptImageUrl && (
                    <a
                      href={p.receiptImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0d7a3e] hover:underline"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      عرض صورة الإيصال
                    </a>
                  )}
                </div>

                {canEdit && (
                  <div className="flex items-center gap-1 shrink-0">
                    {!p.receiptImageUrl && (
                      <label className="w-8 h-8 rounded-full bg-cyan-50 hover:bg-cyan-100 text-cyan-700 grid place-items-center cursor-pointer">
                        {actionLoading === `upload-${p.id}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleReceiptUpload(p.id, f)
                            e.target.value = ''
                          }}
                        />
                      </label>
                    )}
                    <button
                      onClick={() => {
                        setEditing(p)
                        setShowModal(true)
                      }}
                      className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 grid place-items-center"
                      title="تعديل"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={actionLoading === p.id}
                      className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 grid place-items-center disabled:opacity-40"
                      title="حذف"
                    >
                      {actionLoading === p.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <PaymentModal
          applicationId={applicationId}
          payment={editing}
          onClose={() => setShowModal(false)}
          onSaved={async () => {
            setShowModal(false)
            setSuccess(editing ? 'تم تحديث الدفعة' : 'تم إضافة الدفعة')
            await refresh()
          }}
        />
      )}
    </div>
  )
}

function PaymentModal({
  applicationId,
  payment,
  onClose,
  onSaved,
}: {
  applicationId: string
  payment: Payment | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!payment
  const [form, setForm] = useState({
    type: payment?.type || 'inspection',
    amount: payment?.amount?.toString() || '',
    receiptNumber: payment?.receiptNumber || '',
    paidAt: payment?.paidAt
      ? new Date(payment.paidAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    notes: payment?.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) {
      setErr('المبلغ غير صحيح')
      return
    }

    setSaving(true)
    try {
      const body = {
        type: form.type,
        amount,
        receiptNumber: form.receiptNumber || null,
        paidAt: form.paidAt || null,
        notes: form.notes || null,
      }

      const url = isEdit
        ? `/api/staff/applications/${applicationId}/payments/${payment!.id}`
        : `/api/staff/applications/${applicationId}/payments`

      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setErr(data.error || 'فشل الحفظ')
        return
      }
      onSaved()
    } catch {
      setErr('تعذّر الاتصال')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="p-5 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="font-extrabold text-[16px]">
            {isEdit ? 'تعديل دفعة' : 'إضافة دفعة جديدة'}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 grid place-items-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {err && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] font-semibold p-3">
              {err}
            </div>
          )}

          <label className="block">
            <div className="text-[11px] font-bold text-black/70 mb-1.5">
              نوع الدفعة *
            </div>
            <select
              className="input"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
            >
              {Object.entries(PAYMENT_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="text-[11px] font-bold text-black/70 mb-1.5">
              المبلغ (جنيه مصري) *
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="5000"
              required
            />
          </label>

          <label className="block">
            <div className="text-[11px] font-bold text-black/70 mb-1.5">
              رقم الإيصال
            </div>
            <input
              className="input font-mono"
              value={form.receiptNumber}
              onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })}
              placeholder="INSP-2026-001"
            />
          </label>

          <label className="block">
            <div className="text-[11px] font-bold text-black/70 mb-1.5">
              تاريخ الدفع
            </div>
            <input
              type="date"
              className="input"
              value={form.paidAt}
              onChange={(e) => setForm({ ...form, paidAt: e.target.value })}
            />
          </label>

          <label className="block">
            <div className="text-[11px] font-bold text-black/70 mb-1.5">
              ملاحظات
            </div>
            <textarea
              className="input"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="أي ملاحظات إضافية..."
            />
          </label>

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
              className="flex-1 h-11 rounded-full bg-[#0d7a3e] text-white font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
