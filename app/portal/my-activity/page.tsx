'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  Award,
  CheckCircle2,
  FileCheck,
  Loader2,
  TrendingUp,
} from 'lucide-react'

const ACTION_LABELS: Record<string, string> = {
  LOGIN_SUCCESS: 'تسجيل دخول',
  LOGIN_FAILED: 'محاولة دخول فاشلة',
  APPLICATION_CREATE: 'إنشاء طلب',
  APPLICATION_STAGE_CHANGE: 'نقل مرحلة',
  APPLICATION_ASSIGN: 'إسناد طلب',
  DOCUMENT_VERIFY: 'اعتماد مستند',
  DOCUMENT_UNVERIFY: 'إلغاء اعتماد مستند',
  DOCUMENT_UPLOAD: 'رفع مستند',
  CONTRACT_CREATE: 'إنشاء عقد',
  CONTRACT_SIGN: 'توقيع عقد',
  CONTRACT_PDF_DOWNLOAD: 'تحميل عقد PDF',
  APPEAL_APPROVE: 'قبول تظلم',
  APPEAL_REJECT: 'رفض تظلم',
  USER_CREATE: 'إنشاء موظف',
  USER_UPDATE: 'تعديل موظف',
  USER_DELETE: 'حذف موظف',
  CITIZEN_REGISTER: 'تسجيل مواطن',
  EXCEL_EXPORT_APPLICATIONS: 'تصدير الطلبات Excel',
  EXCEL_EXPORT_PAYMENTS: 'تصدير المدفوعات Excel',
  EXCEL_EXPORT_APPEALS: 'تصدير التظلمات Excel',
  PAYMENT_CREATE: 'إضافة دفعة',
  PAYMENT_UPDATE: 'تعديل دفعة',
  PAYMENT_DELETE: 'حذف دفعة',
  PAYMENT_RECEIPT_IMAGE_UPLOAD: 'رفع صورة إيصال',
}

type Log = {
  id: string
  action: string
  entity: string
  entityId: string | null
  createdAt: string
}

type Stats = {
  totalActions: number
  weekActions: number
  stageChanges: number
  docsVerified: number
}

export default function MyActivityPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [stats, setStats] = useState<Stats>({
    totalActions: 0,
    weekActions: 0,
    stageChanges: 0,
    docsVerified: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/staff/my-activity?limit=100')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setLogs(d.logs || [])
          setStats(d.stats || stats)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-extrabold flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#0d7a3e]" />
          نشاطي
        </h1>
        <p className="text-[12px] text-black/55 mt-1">
          سجل كامل لكل الإجراءات التي قمت بها على المنصة
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Award}
          label="إجمالي الإجراءات"
          value={stats.totalActions}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          icon={TrendingUp}
          label="آخر 7 أيام"
          value={stats.weekActions}
          color="text-green-600 bg-green-50"
        />
        <StatCard
          icon={Activity}
          label="نقل مراحل"
          value={stats.stageChanges}
          color="text-purple-600 bg-purple-50"
        />
        <StatCard
          icon={FileCheck}
          label="مستندات معتمدة"
          value={stats.docsVerified}
          color="text-amber-600 bg-amber-50"
        />
      </div>

      <div className="rounded-[18px] bg-white border border-black/5 overflow-hidden">
        <div className="p-4 border-b border-black/5">
          <h2 className="font-extrabold text-[14px]">السجل الكامل</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#0d7a3e]" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <Activity className="w-10 h-10 mx-auto text-black/20" />
            <div className="mt-3 text-[14px] font-bold">لا يوجد نشاط بعد</div>
            <div className="mt-1 text-[12px] text-black/55">
              كل إجراء تقوم به على المنصة هيظهر هنا
            </div>
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-4 hover:bg-[#f9fbf9] transition">
                <div className="w-9 h-9 rounded-[10px] bg-[#0d7a3e]/10 grid place-items-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#0d7a3e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold">
                    {ACTION_LABELS[log.action] || log.action}
                  </div>
                  <div className="text-[11px] text-black/50 mt-0.5">
                    {log.entity}
                    {log.entityId && (
                      <span className="font-mono ms-2">#{log.entityId.slice(0, 8)}</span>
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-black/40 shrink-0">
                  {new Date(log.createdAt).toLocaleString('ar-EG')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Activity
  label: string
  value: number
  color: string
}) {
  return (
    <div className="rounded-[18px] bg-white border border-black/5 p-4">
      <div className={`w-10 h-10 rounded-[12px] grid place-items-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="mt-3 text-[22px] font-extrabold">
        {value.toLocaleString('ar-EG')}
      </div>
      <div className="text-[11px] text-black/55 font-bold">{label}</div>
    </div>
  )
}
