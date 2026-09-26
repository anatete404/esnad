import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MapPin,
  Ruler,
  AlertCircle,
} from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import CitizenAppealSection from '@/components/CitizenAppealSection'
import { getCitizenSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

const STAGE_LABELS: Record<string, string> = {
  SUBMITTED: 'تم التقديم',
  INITIAL_REVIEW: 'مراجعة أولية',
  DOCS_REVIEW: 'فحص المستندات',
  SURVEY: 'معاينة ميدانية',
  PRICING: 'تسعير',
  COMMITTEE: 'عرض على اللجنة',
  CONTRACT: 'تعاقد',
  COMPLETED: 'منجز',
  REJECTED: 'مرفوض',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'نشط',
  ON_HOLD: 'معلّق',
  COMPLETED: 'منجز',
  REJECTED: 'مرفوض',
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-blue-50 text-blue-700 border-blue-200',
  ON_HOLD: 'bg-amber-50 text-amber-800 border-amber-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getCitizenSession()
  if (!session) redirect('/login')

  const { id } = await params

  const application = await prisma.application.findFirst({
    where: { id, citizenId: session.id },
    include: {
      land: true,
      documents: { orderBy: { uploadedAt: 'desc' } },
      stages: { orderBy: { createdAt: 'asc' } },
      contract: true,
      appeal: true,
    },
  })

  if (!application) notFound()

  return (
    <>
      <PublicHeader />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[13px] font-bold text-black/60 hover:text-black mb-6"
        >
          <ArrowRight className="w-4 h-4" />
          رجوع لملفاتي
        </Link>

        <a
          href={`/api/citizen/applications/${application.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#0d7a3e] hover:bg-[#0a5c2f] text-white font-bold text-[12px] transition"
        >
          <Download className="w-4 h-4" />
          تحميل ملف الطلب (PDF)
        </a>

        <div className="rounded-[24px] bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] text-white p-6 md:p-8">
          <div className="text-[12px] opacity-85">رقم التتبع</div>
          <div className="mt-1 text-[22px] md:text-[26px] font-mono font-extrabold tracking-wider" dir="ltr">
            {application.trackingNumber}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-white/15 text-[12px] font-bold">
              {STAGE_LABELS[application.stage] || application.stage}
            </span>
            <span className={`px-3 py-1 rounded-full text-[12px] font-bold border ${STATUS_COLORS[application.status] || 'bg-white/15'}`}>
              {STATUS_LABELS[application.status] || application.status}
            </span>
          </div>
        </div>

        {application.status === 'ON_HOLD' && application.rejectionReason && (
          <div className="mt-6 rounded-[18px] bg-amber-50 border-2 border-amber-300 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-200 grid place-items-center shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-amber-900 text-[15px] mb-1">
                  الطلب موقوف مؤقتًا
                </div>
                <div className="text-[13px] text-amber-800 leading-6">
                  {application.rejectionReason}
                </div>
                {application.rejectedAt && (
                  <div className="mt-2 text-[11px] text-amber-700">
                    بتاريخ: {formatDate(application.rejectedAt)}
                  </div>
                )}
                <div className="mt-3 text-[11px] text-amber-700 leading-5">
                  يمكنك رفع المستندات المطلوبة من صفحة الطلب لاستئناف المعالجة تلقائيًا.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={Calendar} label="تاريخ التقديم" value={formatDate(application.submittedAt)} />
          <StatCard icon={Clock} label="آخر تحديث" value={formatDate(application.updatedAt)} />
          <StatCard icon={Ruler} label="المساحة" value={`${application.land?.totalFaddan?.toFixed(4) || '0'} فدان`} />
        </div>

        <Section title="بيانات الأرض" icon={MapPin}>
          <div className="grid md:grid-cols-2 gap-4">
            <InfoItem label="المحافظة" value={application.land?.gov} />
            <InfoItem label="المركز" value={application.land?.center} />
            <InfoItem label="القرية" value={application.land?.village} />
            <InfoItem label="وصف الموقع" value={application.land?.detail} />
            <InfoItem label="سبب وضع اليد" value={application.land?.handReason} />
            <InfoItem label="النشاط" value={application.land?.activity} />
            <InfoItem label="مصدر المياه" value={application.land?.waterSource} />
            <InfoItem label="حالة الأرض" value={application.land?.landStatus} />
          </div>
        </Section>

        <Section title="المستندات" icon={FileText}>
          {application.documents.length === 0 ? (
            <div className="text-[13px] text-black/50 text-center py-4">
              لا توجد مستندات مرفوعة بعد
            </div>
          ) : (
            <div className="space-y-2">
              {application.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-xl bg-[#f9fbf9] border border-black/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0d7a3e]/10 grid place-items-center">
                      <FileText className="w-4 h-4 text-[#0d7a3e]" />
                    </div>
                    <div>
                      <div className="text-[12px] font-bold">{doc.originalName}</div>
                      <div className="text-[10px] text-black/50">
                        {(doc.size / 1024).toFixed(0)} KB • {doc.type}
                      </div>
                    </div>
                  </div>
                  {doc.isVerified && (
                    <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold border border-green-200">
                      معتمد
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        <div className="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-4 text-[12px] text-blue-900 leading-7">
          <div className="font-bold flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4" />
            معلومة
          </div>
          حالة الطلب تتحدث تلقائياً عند كل إجراء. لو محتاج إضافة مستندات أو الاستفسار،
          تواصل مع خدمة العملاء.
        </div>
        <div className="mt-6">
          <CitizenAppealSection
            applicationId={application.id}
            applicationStatus={application.status}
            initialAppeal={application.appeal}
          />
        </div>
      </div>
      <PublicFooter />
    </>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="rounded-[16px] bg-white border border-black/5 p-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-[10px] bg-[#0d7a3e]/10 grid place-items-center">
          <Icon className="w-4 h-4 text-[#0d7a3e]" />
        </div>
        <div className="text-[11px] text-black/55 font-semibold">{label}</div>
      </div>
      <div className="mt-2 text-[15px] font-extrabold">{value}</div>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-[20px] bg-white border border-black/5 p-5 md:p-6">
      <h2 className="font-extrabold text-[15px] flex items-center gap-2">
        <Icon className="w-5 h-5 text-[#0d7a3e]" />
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl bg-[#f9fbf9] border border-black/5 p-3">
      <div className="text-[10px] text-black/50 font-bold">{label}</div>
      <div className="mt-1 text-[13px] font-bold text-black/85">
        {value || <span className="text-black/30">—</span>}
      </div>
    </div>
  )
}
