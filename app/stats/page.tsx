import {
  Activity,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  TrendingUp,
  Users,
} from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const [
    totalApplications,
    completedApplications,
    activeApplications,
    totalCitizens,
    completedWithDates,
    govBreakdown,
  ] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({ where: { status: 'COMPLETED' } }),
    prisma.application.count({ where: { status: 'ACTIVE' } }),
    prisma.citizen.count(),
    prisma.application.findMany({
      where: { status: 'COMPLETED', completedAt: { not: null } },
      select: { submittedAt: true, completedAt: true },
      take: 500,
    }),
    prisma.land.groupBy({
      by: ['gov'],
      _count: { _all: true },
    }),
  ])

  const avgDuration = completedWithDates.length
    ? Math.round(
        completedWithDates.reduce((acc, a) => {
          if (!a.completedAt) return acc
          return acc + (new Date(a.completedAt).getTime() - new Date(a.submittedAt).getTime())
        }, 0) /
          completedWithDates.length /
          (1000 * 60 * 60 * 24)
      )
    : 0

  const completionRate = totalApplications
    ? Math.round((completedApplications / totalApplications) * 100)
    : 0

  const sortedGovs = govBreakdown
    .filter((g) => g.gov)
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, 8)

  const maxGov = sortedGovs.length > 0 ? sortedGovs[0]._count._all : 1

  const stats = [
    { icon: FileText, label: 'إجمالي الطلبات', value: totalApplications.toLocaleString('ar-EG'), color: 'blue' },
    { icon: CheckCircle2, label: 'طلبات مكتملة', value: completedApplications.toLocaleString('ar-EG'), color: 'green' },
    { icon: Activity, label: 'طلبات نشطة', value: activeApplications.toLocaleString('ar-EG'), color: 'amber' },
    { icon: Users, label: 'مواطنون مسجلون', value: totalCitizens.toLocaleString('ar-EG'), color: 'purple' },
    { icon: TrendingUp, label: 'معدل الإنجاز', value: `${completionRate}%`, color: 'green' },
    { icon: Clock, label: 'متوسط مدة الإنجاز', value: avgDuration ? `${avgDuration} يوم` : '—', color: 'blue' },
  ]

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <>
      <PublicHeader />
      <section className="bg-gradient-to-l from-[#0d7a3e]/8 to-transparent py-12 md:py-16">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/5 shadow-sm text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#0d7a3e] animate-pulse" />
            إحصائيات حيّة
          </div>
          <h1 className="mt-5 text-[28px] md:text-[40px] font-extrabold tracking-tight leading-tight">
            مؤشرات المنصة
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f]">
              بشفافية كاملة
            </span>
          </h1>
          <p className="mt-4 text-[14px] md:text-[16px] text-black/65 leading-8 max-w-[62ch] mx-auto">
            نشارك معكم مؤشرات الأداء الحقيقية للمنصة، بشكل محدّث تلقائيًا من قاعدة البيانات.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-12 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 stagger-children">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-[20px] bg-white border border-black/5 p-5 card-hover"
            >
              <div className={`w-11 h-11 rounded-[12px] grid place-items-center ${colorClasses[s.color]}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="mt-3 text-[24px] font-extrabold">{s.value}</div>
              <div className="text-[12px] text-black/55 font-bold">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {sortedGovs.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-4 pb-12 md:px-6">
          <div className="rounded-[24px] bg-white border border-black/5 p-6 md:p-8">
            <h2 className="font-extrabold text-[18px] flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-[#0d7a3e]" />
              توزيع الطلبات حسب المحافظة
            </h2>
            <div className="space-y-4">
              {sortedGovs.map((g) => (
                <div key={g.gov}>
                  <div className="flex items-center justify-between text-[12px] font-bold mb-2">
                    <span>{g.gov}</span>
                    <span className="text-black/50">{g._count._all}</span>
                  </div>
                  <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0d7a3e] rounded-full transition-all"
                      style={{ width: `${(g._count._all / maxGov) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1280px] px-4 pb-16 md:px-6">
        <div className="rounded-[24px] bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] text-white p-8 md:p-10 text-center">
          <h2 className="text-[20px] md:text-[24px] font-extrabold">
            جاهز تقدم طلبك؟
          </h2>
          <p className="mt-2 text-[13px] opacity-85">
            سجّل حسابك وابدأ رحلة التقنين الآن — كل البيانات بشفافية كاملة
          </p>
          <a
            href="/register"
            className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-white text-black font-bold text-[14px] px-7 btn-press"
          >
            سجّل الآن مجاناً
          </a>
        </div>
      </section>
      <PublicFooter />
    </>
  )
}
