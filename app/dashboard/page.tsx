import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertCircle, Clock, FileText, MapPinned, ShieldCheck } from 'lucide-react'
import { getCitizenSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function CitizenDashboard() {
  const session = await getCitizenSession()
  if (!session) {
    redirect('/login')
  }

  const citizen = await prisma.citizen.findUnique({
    where: { id: session.id },
    include: {
      applications: {
        orderBy: { submittedAt: 'desc' },
        include: {
          land: true,
          _count: { select: { documents: true } },
        },
      },
    },
  })

  if (!citizen) {
    redirect('/login')
  }

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
  const totalDocs = citizen.applications.reduce((sum, a) => sum + (a._count?.documents || 0), 0)
  const stats = [
    { label: 'طلبات سارية', value: String(citizen.applications.filter((a) => a.status === 'ACTIVE').length), icon: FileText },
    { label: 'معلّقة', value: String(citizen.applications.filter((a) => a.status === 'ON_HOLD').length), icon: AlertCircle },
    { label: 'منجزة', value: String(citizen.applications.filter((a) => a.status === 'COMPLETED').length), icon: ShieldCheck },
    { label: 'إجمالي المستندات', value: String(totalDocs), icon: Clock },
    { label: 'الموقع', value: citizen.gov || 'غير محدد', icon: MapPinned },
  ]

  return (
    <div className="min-h-screen bg-[#f7faf7] p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[12px] text-black/60">ملفي الشخصي</div>
              <h1 className="text-[26px] font-extrabold text-[#0a5c2f]">{citizen.fullName}</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/" className="rounded-full border border-black/10 px-4 py-2 text-[12px] font-bold text-black">
                الرئيسية
              </Link>
              <Link href="/apply" className="rounded-full bg-[#0d7a3e] px-4 py-2 text-[12px] font-bold text-white">
                تقديم طلب جديد
              </Link>
              <form action="/api/auth/citizen/logout" method="post">
                <button type="submit" className="rounded-full border border-black/10 px-4 py-2 text-[12px] font-bold text-black">
                  خروج
                </button>
              </form>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {stats.map((item) => (
            <div key={item.label} className="rounded-[20px] border border-black/5 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-black/60">{item.label}</div>
                  <div className="mt-2 text-[24px] font-extrabold text-[#0a5c2f]">{item.value}</div>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0d7a3e]/10 text-[#0d7a3e]">
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-extrabold text-[#0a5c2f]">طلباتي</h2>
            <Link href="/track" className="text-[12px] font-bold text-[#0d7a3e]">
              متابعة الطلبات
            </Link>
          </div>

          <div className="space-y-3">
            {citizen.applications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 bg-[#f9fbf9] p-8 text-center text-[13px] text-black/60">
                لم تقم بتقديم أي طلب بعد.
              </div>
            ) : (
              citizen.applications.map((application) => (
                <div key={application.id} className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-[#f9fbf9] p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="text-[13px] font-extrabold text-[#0a5c2f]">{application.trackingNumber}</div>
                    <div className="text-[12px] text-black/60">
                      {application.land?.gov || 'موقع غير محدد'} • {STAGE_LABELS[application.stage] || application.stage}
                    </div>
                    {application.status === 'ON_HOLD' && application.rejectionReason && (
                      <div className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                        <div className="text-[11px] text-amber-800 leading-5">
                          <span className="font-bold">سبب الإيقاف: </span>
                          {application.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[12px]">
                    <span className={`rounded-full px-2 py-1 font-bold ${
                      application.status === 'ON_HOLD'
                        ? 'bg-amber-50 text-amber-800'
                        : application.status === 'COMPLETED'
                          ? 'bg-green-50 text-green-700'
                          : application.status === 'REJECTED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-[#e8f4ed] text-[#0d7a3e]'
                    }`}>
                      {STATUS_LABELS[application.status] || application.status}
                    </span>
                    <Link href={`/dashboard/${application.id}`} className="rounded-full border border-black/10 px-3 py-1.5 font-bold text-black hover:bg-black/5">
                      تفاصيل
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
