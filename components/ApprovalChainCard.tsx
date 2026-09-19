'use client'

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  ShieldCheck,
  XCircle,
} from 'lucide-react'

type Step = {
  id: string
  level: number
  roleRequired: string
  title: string
  status: string
  notes: string | null
  approvedAt: string | null
  approvedBy: { id: string; fullName: string } | null
}

type Props = {
  applicationId: string
  applicationStage: string
  currentUserRole: string
  onRefresh?: () => void
}

const ROLE_LABELS: Record<string, string> = {
  reviewer: 'فاحص',
  legal: 'مراجع قانوني',
  branch_manager: 'مدير فرع',
  admin: 'مدير النظام',
}

export default function ApprovalChainCard({
  applicationId,
  applicationStage: _applicationStage,
  currentUserRole,
  onRefresh,
}: Props) {
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [openNotes, setOpenNotes] = useState<string | null>(null)
  const [notesDraft, setNotesDraft] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/staff/applications/${applicationId}/approvals`)
      if (res.ok) {
        const data = await res.json()
        setSteps(data.steps || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId])

  const submit = async (stepId: string, decision: 'APPROVED' | 'REJECTED') => {
    setActing(stepId)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/staff/applications/${applicationId}/approvals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId,
          decision,
          notes: notesDraft.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'فشلت العملية')
        return
      }
      setSuccess(decision === 'APPROVED' ? 'تمت الموافقة' : 'تم الرفض')
      setOpenNotes(null)
      setNotesDraft('')
      await load()
      onRefresh?.()
    } catch {
      setError('تعذّر الاتصال')
    } finally {
      setActing(null)
    }
  }

  if (loading) {
    return (
      <div className="rounded-[18px] bg-white border border-black/5 p-5">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-[#0d7a3e]" />
        </div>
      </div>
    )
  }

  if (steps.length === 0) return null

  const allApproved = steps.every((step) => step.status === 'APPROVED')
  const hasRejected = steps.some((step) => step.status === 'REJECTED')

  return (
    <div className="rounded-[18px] bg-white border border-black/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-[14px] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0d7a3e]" />
          سلسلة الموافقات
        </h3>
        {allApproved && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
            مكتملة
          </span>
        )}
        {hasRejected && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
            مرفوضة
          </span>
        )}
      </div>

      {error && (
        <div className="mb-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] font-semibold p-3 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-[12px] font-semibold p-3 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          {success}
        </div>
      )}

      <div className="space-y-2.5">
        {steps.map((step) => {
          const isPending = step.status === 'PENDING'
          const isApproved = step.status === 'APPROVED'
          const isRejected = step.status === 'REJECTED'
          const previousApproved =
            step.level === 1 ||
            steps.find((item) => item.level === step.level - 1)?.status === 'APPROVED'
          const canAct =
            isPending &&
            previousApproved &&
            (currentUserRole === 'admin' || currentUserRole === step.roleRequired)
          const isLocked = isPending && !previousApproved

          return (
            <div
              key={step.id}
              className={`rounded-xl border p-3.5 transition ${
                isApproved
                  ? 'bg-green-50/50 border-green-200'
                  : isRejected
                    ? 'bg-red-50/50 border-red-200'
                    : isLocked
                      ? 'bg-[#f9fbf9] border-black/5 opacity-70'
                      : 'bg-[#fbfaf2] border-[#c89a2c]/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-[10px] grid place-items-center shrink-0 ${
                    isApproved
                      ? 'bg-green-500 text-white'
                      : isRejected
                        ? 'bg-red-500 text-white'
                        : isLocked
                          ? 'bg-black/10 text-black/40'
                          : 'bg-[#c89a2c] text-white'
                  }`}
                >
                  {isApproved ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isRejected ? (
                    <XCircle className="w-4 h-4" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-black/40">المستوى {step.level}</span>
                    <span className="text-[10px] font-bold text-[#0d7a3e] bg-[#0d7a3e]/10 px-2 py-0.5 rounded-full">
                      {ROLE_LABELS[step.roleRequired] || step.roleRequired}
                    </span>
                  </div>
                  <div className="mt-1 text-[13px] font-bold text-black">{step.title}</div>

                  {isApproved && step.approvedBy && (
                    <div className="mt-2 text-[11px] text-green-800">
                      اعتمدها {step.approvedBy.fullName}
                      {step.approvedAt && (
                        <span className="text-black/40">
                          {' '}
                          — {new Date(step.approvedAt).toLocaleDateString('ar-EG')}
                        </span>
                      )}
                    </div>
                  )}
                  {isApproved && step.notes && (
                    <div className="mt-1.5 text-[11px] text-black/60 italic">"{step.notes}"</div>
                  )}
                  {isRejected && step.notes && (
                    <div className="mt-2 text-[11px] text-red-800">سبب الرفض: {step.notes}</div>
                  )}
                  {isLocked && (
                    <div className="mt-1.5 text-[10px] text-black/50">بانتظار اعتماد المستوى السابق</div>
                  )}
                </div>
              </div>

              {canAct && (
                <div className="mt-3 pt-3 border-t border-black/5">
                  {openNotes === step.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="ملاحظات (اختياري)..."
                        className="input"
                        rows={2}
                        maxLength={500}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => void submit(step.id, 'APPROVED')}
                          disabled={acting === step.id}
                          className="flex-1 h-9 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-[12px] flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {acting === step.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              تأكيد الموافقة
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => void submit(step.id, 'REJECTED')}
                          disabled={acting === step.id}
                          className="flex-1 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-[12px] flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          رفض
                        </button>
                        <button
                          onClick={() => {
                            setOpenNotes(null)
                            setNotesDraft('')
                          }}
                          className="h-9 px-3 rounded-full border border-black/10 font-bold text-[12px]"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setOpenNotes(step.id)}
                      className="h-9 px-4 rounded-full bg-[#0d7a3e] hover:bg-[#0a5c2f] text-white font-bold text-[12px] flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      اتخاذ إجراء
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
