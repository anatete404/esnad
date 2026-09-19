'use client'

import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSignature,
  FileText,
  Loader2,
  Plus,
  X,
} from 'lucide-react'

type Contract = {
  id: string
  contractNo: string
  value: number
  paymentPlan: string | null
  signedAt: string | Date | null
  createdAt: string | Date
}

type Props = {
  applicationId: string
  applicationStage: string
  applicationStatus: string
  initialContract: Contract | null
  canEdit: boolean
  onRefresh?: () => void
}

function formatCurrency(n: number): string {
  return n.toLocaleString('ar-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function ContractManager({
  applicationId,
  applicationStage,
  applicationStatus,
  initialContract,
  canEdit,
  onRefresh,
}: Props) {
  const [contract, setContract] = useState<Contract | null>(initialContract)
  const [showModal, setShowModal] = useState(false)
  const [signing, setSigning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ value: '', paymentPlan: '' })

  const isRejected = applicationStatus === 'REJECTED'
  const canCreate = !contract && !isRejected

  const refresh = async () => {
    try {
      const res = await fetch(`/api/staff/applications/${applicationId}`)
      if (res.ok) {
        const data = await res.json()
        setContract(data.application.contract || null)
      }
      if (onRefresh) onRefresh()
    } catch {}
  }

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const value = parseFloat(form.value)
    if (!value || value <= 0) {
      setError('القيمة غير صحيحة')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/staff/applications/${applicationId}/contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, paymentPlan: form.paymentPlan || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'فشل الإنشاء')
        return
      }
      setSuccess('تم إنشاء العقد بنجاح')
      setShowModal(false)
      setForm({ value: '', paymentPlan: '' })
      await refresh()
    } catch {
      setError('تعذّر الاتصال')
    } finally {
      setSaving(false)
    }
  }

  const handleSign = async () => {
    if (!contract) return
    if (!confirm(`تأكيد توقيع العقد رقم ${contract.contractNo}؟`)) return

    setSigning(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/staff/contracts/${contract.id}/sign`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'فشل التوقيع')
        return
      }
      setSuccess('تم توقيع العقد بنجاح')
      await refresh()
    } catch {
      setError('تعذّر الاتصال')
    } finally {
      setSigning(false)
    }
  }

  if (!contract) {
    return (
      <div className="rounded-[18px] bg-white border border-black/5 p-5">
        <h3 className="font-extrabold text-[14px] flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-[#0d7a3e]" />
          العقد
        </h3>
        {error && (
          <div className="mb-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] font-semibold p-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{error}</span>
            <button onClick={() => setError('')} className="font-bold">×</button>
          </div>
        )}
        {!canCreate ? (
          <div className="rounded-xl bg-[#f9fbf9] border border-black/5 p-4 text-center text-[12px] text-black/60">
            {isRejected ? 'لا يمكن إنشاء عقد لطلب مرفوض' : 'لم يتم إنشاء عقد لهذا الطلب بعد'}
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-[#f9fbf9] border border-black/5 p-4 mb-3 text-center text-[12px] text-black/60">لم يتم إنشاء عقد لهذا الطلب بعد</div>
            {canEdit && (
              <button onClick={() => setShowModal(true)} className="w-full h-10 rounded-full bg-[#0d7a3e] hover:bg-[#0a5c2f] text-white font-bold text-[13px] flex items-center justify-center gap-2 transition">
                <Plus className="w-4 h-4" /> إنشاء عقد جديد
              </button>
            )}
          </>
        )}
        {showModal && <CreateContractModal form={form} setForm={setForm} saving={saving} error={error} onClose={() => setShowModal(false)} onSubmit={submitCreate} />}
      </div>
    )
  }

  const isSigned = !!contract.signedAt

  return (
    <div className="rounded-[18px] bg-white border border-black/5 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold text-[14px] flex items-center gap-2"><FileText className="w-4 h-4 text-[#0d7a3e]" />العقد</h3>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isSigned ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
          {isSigned ? 'موقّع' : 'بانتظار التوقيع'}
        </span>
      </div>
      {error && <div className="mb-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] font-semibold p-3 flex items-center justify-between"><span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{error}</span><button onClick={() => setError('')} className="font-bold">×</button></div>}
      {success && <div className="mb-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-[12px] font-semibold p-3 flex items-center justify-between"><span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />{success}</span><button onClick={() => setSuccess('')} className="font-bold">×</button></div>}
      <div className="space-y-2 text-[12px]">
        <div className="flex justify-between py-2 border-b border-black/[0.06]"><span className="text-black/50">رقم العقد</span><span className="font-mono font-bold">{contract.contractNo}</span></div>
        <div className="flex justify-between py-2 border-b border-black/[0.06]"><span className="text-black/50">القيمة</span><span className="font-bold">{formatCurrency(contract.value)} ج.م</span></div>
        {contract.paymentPlan && <div className="flex justify-between py-2 border-b border-black/[0.06]"><span className="text-black/50">خطة الدفع</span><span className="font-bold">{contract.paymentPlan}</span></div>}
        {isSigned && <div className="flex justify-between py-2 border-b border-black/[0.06]"><span className="text-black/50">تاريخ التوقيع</span><span className="font-bold">{new Date(contract.signedAt as string).toLocaleDateString('ar-EG')}</span></div>}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={`/api/staff/contracts/${contract.id}/pdf`} target="_blank" rel="noopener noreferrer" className="h-9 px-4 rounded-full bg-[#0d7a3e] hover:bg-[#0a5c2f] text-white text-[12px] font-bold flex items-center gap-1.5 transition"><Download className="w-3.5 h-3.5" />تحميل PDF</a>
        {!isSigned && canEdit && <button onClick={handleSign} disabled={signing} className="h-9 px-4 rounded-full bg-[#c89a2c] hover:bg-[#a87f1e] text-black text-[12px] font-bold flex items-center gap-1.5 transition disabled:opacity-50">{signing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSignature className="w-3.5 h-3.5" />}توقيع العقد</button>}
      </div>
    </div>
  )
}

function CreateContractModal({ form, setForm, saving, error, onClose, onSubmit }: { form: { value: string; paymentPlan: string }; setForm: (f: { value: string; paymentPlan: string }) => void; saving: boolean; error: string; onClose: () => void; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="p-5 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white z-10"><div className="font-extrabold text-[16px]">إنشاء عقد جديد</div><button onClick={onClose} className="w-8 h-8 rounded-full bg-black/5 grid place-items-center"><X className="w-4 h-4" /></button></div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {error && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] font-semibold p-3">{error}</div>}
          <label className="block"><div className="text-[11px] font-bold text-black/70 mb-1.5">قيمة العقد (جنيه مصري) *</div><input type="number" step="0.01" min="0" className="input" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="100000" required autoFocus /></label>
          <label className="block"><div className="text-[11px] font-bold text-black/70 mb-1.5">خطة الدفع (اختياري)</div><textarea className="input" value={form.paymentPlan} onChange={(e) => setForm({ ...form, paymentPlan: e.target.value })} placeholder="مثال: 30% مقدم + 70% على 12 شهر..." /></label>
          <div className="flex gap-3 pt-2"><button type="button" onClick={onClose} className="flex-1 h-11 rounded-full border border-black/10 font-bold text-[13px]">إلغاء</button><button type="submit" disabled={saving} className="flex-1 h-11 rounded-full bg-[#0d7a3e] text-white font-bold text-[13px] flex items-center justify-center gap-2 disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />إنشاء</>}</button></div>
        </form>
      </div>
    </div>
  )
}
