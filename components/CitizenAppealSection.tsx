'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, FileWarning, MessageSquareWarning, XCircle } from 'lucide-react'
import AppealSubmitModal from './AppealSubmitModal'

type Appeal = { id: string; reason: string; details: string | null; status: string; decisionNotes: string | null; reviewedAt: string | Date | null; createdAt: string | Date }
type Props = { applicationId: string; applicationStatus: string; initialAppeal: Appeal | null }

export default function CitizenAppealSection({ applicationId, applicationStatus, initialAppeal }: Props) {
  const [appeal, setAppeal] = useState<Appeal | null>(initialAppeal)
  const [showModal, setShowModal] = useState(false)
  const [success, setSuccess] = useState('')
  const refresh = async () => { try { const res = await fetch(`/api/citizen/applications/${applicationId}/appeal`); if (res.ok) setAppeal((await res.json()).appeal) } catch {} }
  const handleSubmitted = async () => { setShowModal(false); setSuccess('تم تقديم التظلم بنجاح. سيراجعه موظف مختص.'); await refresh() }
  const isRejected = applicationStatus === 'REJECTED'
  const canSubmit = isRejected && !appeal

  return <>
    <div className="rounded-[20px] overflow-hidden border border-black/5 bg-white shadow-sm">
      <div className="bg-[#c89a2c] px-5 py-3 flex items-center gap-2"><MessageSquareWarning className="w-5 h-5 text-white" /><h3 className="text-white text-[14px] font-extrabold">التظلمات</h3></div>
      <div className="p-5">
        {success && <div className="mb-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-[12px] font-semibold p-3 flex items-center justify-between"><span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />{success}</span><button onClick={() => setSuccess('')} className="font-bold">×</button></div>}
        {!appeal && !isRejected && <div className="rounded-xl bg-[#f9fbf9] border border-black/5 p-4 text-center text-[12px] text-black/60">التظلم متاح فقط للطلبات المرفوضة</div>}
        {!appeal && canSubmit && <><div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-3"><div className="flex items-center gap-2 text-red-700 font-bold text-[13px]"><FileWarning className="w-4 h-4" />تم رفض هذا الطلب</div><div className="text-[11px] text-red-700 mt-1 leading-6">يمكنك تقديم تظلم خلال الفترة النظامية. سيتم مراجعة تظلمك من قبل موظف مختص.</div></div><button onClick={() => setShowModal(true)} className="w-full h-11 rounded-full bg-[#c89a2c] hover:bg-[#a87f1e] text-black font-bold text-[13px] flex items-center justify-center gap-2 transition"><MessageSquareWarning className="w-4 h-4" />تقديم تظلم</button></>}
        {appeal && <div className="space-y-3"><StatusBadge status={appeal.status} /><div className="rounded-xl bg-[#f9fbf9] border border-black/5 p-3"><div className="text-[10px] text-black/50 font-bold mb-1">سبب التظلم</div><div className="text-[12px] font-bold text-black/85">{appeal.reason}</div></div>{appeal.details && <div className="rounded-xl bg-[#f9fbf9] border border-black/5 p-3"><div className="text-[10px] text-black/50 font-bold mb-1">تفاصيل إضافية</div><div className="text-[12px] text-black/75 leading-6 whitespace-pre-line">{appeal.details}</div></div>}<div className="flex items-center gap-1.5 text-[11px] text-black/50"><Clock className="w-3 h-3" />تم التقديم: {new Date(appeal.createdAt).toLocaleDateString('ar-EG')}</div>{appeal.status !== 'PENDING' && appeal.decisionNotes && <div className={`rounded-xl p-3 border ${appeal.status === 'APPROVED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}><div className={`text-[10px] font-bold mb-1 ${appeal.status === 'APPROVED' ? 'text-green-700' : 'text-red-700'}`}>ملاحظات المراجع</div><div className={`text-[12px] leading-6 ${appeal.status === 'APPROVED' ? 'text-green-900' : 'text-red-900'}`}>{appeal.decisionNotes}</div></div>}{appeal.reviewedAt && <div className="text-[11px] text-black/50">تاريخ القرار: {new Date(appeal.reviewedAt).toLocaleDateString('ar-EG')}</div>}</div>}
      </div>
    </div>
    {showModal && <AppealSubmitModal applicationId={applicationId} onClose={() => setShowModal(false)} onSubmitted={handleSubmitted} />}
  </>
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'PENDING') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold"><Clock className="w-3 h-3" />قيد المراجعة</span>
  if (status === 'APPROVED') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold"><CheckCircle2 className="w-3 h-3" />تم قبول التظلم</span>
  if (status === 'REJECTED') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold"><XCircle className="w-3 h-3" />تم رفض التظلم</span>
  return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-[11px] font-bold"><AlertCircle className="w-3 h-3" />{status}</span>
}
