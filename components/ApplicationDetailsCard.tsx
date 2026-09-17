import {
  Calendar,
  FileText,
  Hash,
  Info,
  MapPin,
  Phone,
  Receipt,
  User,
} from 'lucide-react'
import ApplicationTimeline from './ApplicationTimeline'
import AuthorityEditor from './AuthorityEditor'
import PaymentsManager from './PaymentsManager'
import { resolveStatusNote } from '@/lib/statusNote'

type Payment = {
  id: string
  type: string
  amount: number
  receiptNumber: string | null
  receiptImageUrl: string | null
  paidAt: Date | string | null
  notes: string | null
}

type Props = {
  application: {
    trackingNumber: string
    submittedAt: Date | string
    stage: string
    status: string
    statusNote: string | null
    statusNoteManual: boolean
    citizen: {
      fullName: string
      nationalId: string
      phone: string
    }
    land: {
      authorityName: string | null
      gov: string | null
    } | null
    payments: Payment[]
  }
  applicationId?: string
  canEdit?: boolean
}

function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatCurrency(n: number): string {
  return n.toLocaleString('ar-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function ApplicationDetailsCard({
  application,
  applicationId,
  canEdit = false,
}: Props) {
  const statusNote = resolveStatusNote(
    application.stage,
    application.statusNote,
    application.statusNoteManual
  )

  const inspection = application.payments.find((p) => p.type === 'inspection')
  const survey = application.payments.find((p) => p.type === 'survey')

  return (
    <div className="space-y-4">
      {/* 1) Timeline */}
      <ApplicationTimeline
        stage={application.stage}
        status={application.status}
      />

      {/* 2) بيانات مقدم الطلب (صاحب الشأن) */}
      <div className="rounded-[20px] overflow-hidden border border-black/5 bg-white shadow-sm">
        {/* Header */}
        <div className="bg-[#0d7a3e] px-5 py-3.5">
          <h2 className="text-white text-[15px] md:text-[16px] font-extrabold text-center">
            بيانات مقدم الطلب (صاحب الشأن)
          </h2>
        </div>

        {/* Table */}
        <div className="divide-y divide-black/[0.06]">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            <Field
              icon={Hash}
              label="رقم الطلب"
              value={application.trackingNumber}
              mono
            />
            <Field
              icon={Calendar}
              label="تاريخ الطلب"
              value={formatDate(application.submittedAt)}
              border
            />
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            <Field
              icon={User}
              label="الإسم"
              value={application.citizen.fullName}
            />
            <Field
              icon={User}
              label="الرقم القومي"
              value={application.citizen.nationalId}
              mono
              border
            />
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            {applicationId ? (
              <AuthorityEditor
                applicationId={applicationId}
                initialAuthority={application.land?.authorityName || null}
                canEdit={canEdit}
              />
            ) : (
              <Field
                icon={MapPin}
                label="جهة الولاية"
                value={application.land?.authorityName || 'غير محدد'}
              />
            )}
            <Field
              icon={Phone}
              label="رقم الموبايل"
              value={application.citizen.phone}
              mono
              border
            />
          </div>

          {/* Row 4 — رسوم الفحص */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            <Field
              icon={FileText}
              label="رقم إيصال الفحص"
              value={inspection?.receiptNumber || '—'}
              mono
            />
            <Field
              icon={Receipt}
              label="رسوم الفحص"
              value={inspection ? `${formatCurrency(inspection.amount)} جنيه مصري` : '—'}
              border
            />
          </div>

          {/* Row 5 — رسوم المعاينة */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            <Field
              icon={FileText}
              label="رقم إيصال المعاينة"
              value={survey?.receiptNumber || '—'}
              mono
            />
            <Field
              icon={Receipt}
              label="رسوم المعاينة"
              value={survey ? `${formatCurrency(survey.amount)} جنيه مصري` : '—'}
              border
            />
          </div>
        </div>
      </div>

      {/* 3) موقف طلب التقنين */}
      <div className="rounded-[20px] overflow-hidden border border-black/5 bg-white shadow-sm">
        <div className="bg-[#4a4a4a] px-5 py-3">
          <h3 className="text-white text-[14px] md:text-[15px] font-extrabold text-center">
            موقف طلب التقنين
          </h3>
        </div>
        <div className="p-4">
          <div className="rounded-xl bg-[#e8f4ed] border border-[#0d7a3e]/20 p-4 flex items-center gap-3">
            <Info className="w-5 h-5 text-[#0d7a3e] shrink-0" />
            <span className="text-[13px] md:text-[14px] font-bold text-[#0a5c2f]">
              {statusNote}
            </span>
          </div>
        </div>
      </div>
      {applicationId && (
        <PaymentsManager
          applicationId={applicationId}
          initialPayments={application.payments}
          canEdit={canEdit}
        />
      )}
    </div>
  )
}

function Field({
  icon: Icon,
  label,
  value,
  mono,
  border,
}: {
  icon: typeof User
  label: string
  value: string
  mono?: boolean
  border?: boolean
}) {
  return (
    <div
      className={`px-5 py-3 flex items-center gap-3 ${border ? 'md:border-r border-black/[0.06]' : ''}`}
    >
      <div className="flex items-center gap-2 text-black/45 shrink-0">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[11px] font-bold text-black/55">{label}</span>
      </div>
      <div
        className={`flex-1 text-left md:text-right text-[13px] font-bold text-black/85 truncate ${mono ? 'font-mono' : ''}`}
        dir={mono ? 'ltr' : 'rtl'}
      >
        {value}
      </div>
    </div>
  )
}
