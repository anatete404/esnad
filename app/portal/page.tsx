import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Users,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can, scopeWhere } from '@/lib/rbac'

export default async function PortalDashboard() {
  const session = await getUserSession()
  if (!session) redirect('/portal/login')

  const where = scopeWhere(session, 'BRANCH')

  const [
    totalApplications,
    activeApplications,
    onHoldApplications,
    completedApplications,
    recentApplications,
    stagesBreakdown,
  ] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.count({ where: { ...where, status: 'ACTIVE' } }),
    prisma.application.count({ where: { ...where, status: 'ON_HOLD' } }),
    prisma.application.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.application.findMany({
      where,
      take: 8,
      orderBy: { submittedAt: 'desc' },
      include: {
        citizen: { select: { fullName: true } },
        land: { select: { gov: true, totalFaddan: true } },
      },
    }),
    prisma.application.groupBy({
      by: ['stage'],
      where,
      _count: { _all: true },
    }),
  ])

  const stats = [
    { label: 'إجمالي الطلبات', value: totalApplications, icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: 'نشطة', value: activeApplications, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
    { label: 'معلّقة', value: onHoldApplications, icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
    { label: 'مكتملة', value: completedApplications, icon: CheckCircle2, color: 'text-[#0d7a3e] bg-[#0d7a3e]/10' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[20px] bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] text-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[12px] opacity-85">لوحة التحكم</div>
            <div className="mt-1 text-[22px] md:text-[26px] font-extrabold">
              أهلاً {session.fullName}
            </div>
            <div className="mt-1 text-[12px] opacity-85">
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          <div className="rounded-full bg-white/15 px-4 py-2 text-[12px] font-bold">
            {session.roleKey}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[18px] bg-white border border-black/5 p-4">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-[12px] grid place-items-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[24px] font-extrabold">{s.value}</div>
            <div className="text-[11px] text-black/55 font-bold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
        {/* Recent applications */}
        <div className="rounded-[20px] bg-white border border-black/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[15px]">أحدث الطلبات</h2>
            <Link href="/portal/applications" className="text-[12px] font-bold text-[#0d7a3e]">
              عرض الكل ←
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-10 text-[13px] text-black/50">
              لا توجد طلبات بعد
            </div>
          ) : (
            <div className="space-y-2">
              {recentApplications.map((app) => (
                <Link
                  key={app.id}
                  href={`/portal/applications/${app.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-[#f9fbf9] transition border border-transparent hover:border-black/5"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] font-bold text-[#0d7a3e]">
                      {app.trackingNumber}
                    </div>
                    <div className="text-[12px] font-bold truncate">
                      {app.citizen.fullName}
                    </div>
                    <div className="text-[10px] text-black/50">
                      {app.land?.gov || '—'} • {app.land?.totalFaddan?.toFixed(2) || '0'} فدان
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-black/50">
                      {new Date(app.submittedAt).toLocaleDateString('ar-EG')}
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#0d7a3e]/10 text-[#0d7a3e] text-[10px] font-bold">
                      {app.stage}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Stages breakdown */}
        <div className="rounded-[20px] bg-white border border-black/5 p-5">
          <h2 className="font-extrabold text-[15px] mb-4">توزيع المراحل</h2>

          {stagesBreakdown.length === 0 ? (
            <div className="text-center py-10 text-[13px] text-black/50">
              لا توجد بيانات
            </div>
          ) : (
            <div className="space-y-3">
              {stagesBreakdown.map((s) => {
                const max = Math.max(...stagesBreakdown.map((x) => x._count._all))
                const pct = (s._count._all / max) * 100
                return (
                  <div key={s.stage}>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span>{s.stage}</span>
                      <span className="text-black/50">{s._count._all}</span>
                    </div>
                    <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#0d7a3e] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
