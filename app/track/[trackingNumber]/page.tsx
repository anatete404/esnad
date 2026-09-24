import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  QrCode,
  Ruler,
  ShieldCheck,
} from 'lucide-react'
import QRCodeDisplay from '@/components/QRCodeDisplay'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import ApplicationDetailsCard from '@/components/ApplicationDetailsCard'
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

export default async function TrackingDetailPage({
  params,
}: {
  params: Promise<{ trackingNumber: string }>
}) {
  const { trackingNumber } = await params
  const decoded = decodeURIComponent(trackingNumber)

  const application = await prisma.application.findUnique({
    where: { trackingNumber: decoded },
    select: {
      id: true,
      trackingNumber: true,
      stage: true,
      status: true,
      statusNote: true,
      statusNoteManual: true,
      submittedAt: true,
      updatedAt: true,
      completedAt: true,
      citizen: {
        select: {
          fullName: true,
          nationalId: true,
          phone: true,
        },
      },
      land: {
        select: {
          gov: true,
          center: true,
          village: true,
          detail: true,
          totalFaddan: true,
          authorityName: true,
        },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          amount: true,
          receiptNumber: true,
          receiptImageUrl: true,
          notes: true,
          paidAt: true,
        },
      },
      stages: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          fromStage: true,
          toStage: true,
          action: true,
          notes: true,
          createdAt: true,
        },
      },
    },
  })

  if (!application) {
    notFound()
  }

  return (
    <>
      <PublicHeader />
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <Link
          href="/track"
          className="inline-flex items-center gap-2 text-[13px] font-bold text-black/60 hover:text-black mb-6"
        >
          <ArrowRight className="w-4 h-4" />
          بحث برقم آخر
        </Link>
        <ApplicationDetailsCard
          application={application}
          applicationId={application.id}
          canEdit={false}
        />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={Calendar}
            label="تاريخ التقديم"
            value={formatDate(application.submittedAt)}
          />
          <StatCard
            icon={Clock}
            label="آخر تحديث"
            value={formatDate(application.updatedAt)}
          />
          <StatCard
            icon={Ruler}
            label="المساحة"
            value={`${application.land?.totalFaddan?.toFixed(4) || '0'} فدان`}
          />
        </div>

        <div className="mt-6 rounded-[20px] bg-white border border-black/5 p-5 md:p-6">
          <h2 className="font-extrabold text-[15px] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#0d7a3e]" />
            بيانات الأرض
          </h2>
          <div className="mt-4 grid md:grid-cols-2 gap-4 text-[13px]">
            <InfoItem label="المحافظة" value={application.land?.gov} />
            <InfoItem label="المركز" value={application.land?.center} />
            <InfoItem label="القرية" value={application.land?.village} />
            <InfoItem label="وصف الموقع" value={application.land?.detail} />
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-[12px] text-amber-900 leading-7">
          <div className="font-bold flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4" />
            تنبيه
          </div>
          هذا الرقم للاستعلام فقط. القرار النهائي على الطلب يصدر من الجهة المختصة.
        </div>

        <div className="mt-6 rounded-[20px] bg-white border border-black/5 p-5">
          <h3 className="font-extrabold text-[14px] flex items-center gap-2 mb-4">
            <QrCode className="w-4 h-4 text-[#0d7a3e]" />
            رمز التتبع السريع
          </h3>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <QRCodeDisplay
              value={`https://hassan-platform.vercel.app/track/${application.trackingNumber}`}
              label="امسح لمتابعة الطلب"
              downloadFileName={`qr-${application.trackingNumber}.png`}
            />
            <div className="flex-1 text-[12px] leading-7 text-black/65">
              يمكنك مسح هذا الرمز بكاميرا الهاتف لمتابعة حالة الطلب مباشرة، أو حفظه ومشاركته مع من تريد.
              الرمز يشير إلى رابط التتبع الرسمي.
            </div>
          </div>
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
