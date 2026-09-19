import {
  Activity,
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  FileSignature,
  FileText,
  MessageSquareWarning,
  TrendingUp,
  Users,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getUserSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const OWNER_FETCH = async () => {
  const session = await getUserSession()
  if (!session) redirect('/portal/login')
  if (session.roleKey !== 'admin' && session.roleKey !== 'branch_manager') {
    redirect('/portal')
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hassan-platform.vercel.app'
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  const res = await fetch(`${baseUrl}/api/staff/owner-dashboard`, {
    headers: { Cookie: cookieHeader },
    cache: 'no-store',
  })

  if (!res.ok) {
    return null
  }

  return res.json()
}

export default async function OwnerDashboardPage() {
  const data = await OWNER_FETCH()

  if (!data) {
    return (
      <div className="rounded-[20px] bg-red-50 border border-red-200 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <div className="mt-3 font-extrabold text-[16px] text-red-700">فشل تحميل بيانات اللوحة</div>
      </div>
    )
  }

  const { stats, monthly, branches, topStaff, recentApplications } = data

  const maxMonth = Math.max(...monthly.map((m: { count: number }) => m.count), 1)
  const maxBranch = Math.max(...branches.map((b: { applications: number }) => b.applications), 1)

  return (
    <div className="space-y-6">
      <div className="rounded-[20px] bg-gradient-to-l from-[#0a0f0d] to-[#1a2a1e] text-white p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] opacity-70 tracking-widest font-bold">OWNER DASHBOARD</div>
            <div className="mt-2 text-[24px] md:text-[28px] font-extrabold">نظرة شاملة على الأداء</div>
            <div className="mt-1 text-[12px] opacity-75">
              {new Date().toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
          <div className="rounded-full bg-[#c89a2c] text-black px-4 py-2 text-[12px] font-extrabold">
            {stats.totalBranches} فروع • {stats.totalUsers} موظف
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={FileText}
          label="إجمالي الطلبات"
          value={stats.totalApplications}
          color="text-blue-600 bg-blue-50"
        />
        <KpiCard
          icon={CheckCircle2}
          label="مكتملة"
          value={stats.completedApplications}
          suffix={` (${stats.completionRate}%)`}
          color="text-green-600 bg-green-50"
        />
        <KpiCard
          icon={Activity}
          label="نشطة"
          value={stats.activeApplications}
          color="text-[#0d7a3e] bg-[#0d7a3e]/10"
        />
        <KpiCard
          icon={Clock}
          label="معلقة"
          value={stats.onHoldApplications}
          color="text-amber-600 bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          icon={Users}
          label="مواطنون مسجلون"
          value={stats.totalCitizens}
          color="text-purple-600 bg-purple-50"
        />
        <KpiCard
          icon={MessageSquareWarning}
          label="تظلمات معلقة"
          value={stats.pendingAppeals}
          suffix={` / ${stats.totalAppeals}`}
          color="text-rose-600 bg-rose-50"
        />
        <KpiCard
          icon={FileSignature}
          label="عقود غير موقعة"
          value={stats.unsignedContracts}
          suffix={` / ${stats.totalContracts}`}
          color="text-indigo-600 bg-indigo-50"
        />
        <div className="rounded-[18px] bg-white border border-black/5 p-4">
          <div className="w-10 h-10 rounded-[12px] grid place-items-center text-[#c89a2c] bg-[#c89a2c]/10">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="mt-3 text-[18px] font-extrabold truncate">
            {Number(stats.totalPaymentsAmount).toLocaleString('ar-EG')}
          </div>
          <div className="text-[11px] text-black/55 font-bold">إجمالي الرسوم (ج.م)</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-[20px] bg-white border border-black/5 p-5">
          <h2 className="font-extrabold text-[15px] flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#0d7a3e]" />
            الطلبات خلال آخر 6 أشهر
          </h2>

          {monthly.length === 0 ? (
            <div className="text-center py-8 text-[12px] text-black/40">لا توجد بيانات</div>
          ) : (
            <div className="space-y-3">
              {monthly.map((m: { month: string; count: number }) => (
                <div key={m.month}>
                  <div className="flex items-center justify-between text-[12px] font-bold mb-1.5">
                    <span className="font-mono">{m.month}</span>
                    <span className="text-black/50">{m.count}</span>
                  </div>
                  <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] rounded-full transition-all"
                      style={{ width: `${(m.count / maxMonth) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[20px] bg-white border border-black/5 p-5">
          <h2 className="font-extrabold text-[15px] flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-[#0d7a3e]" />
            أداء الفروع
          </h2>

          {branches.length === 0 ? (
            <div className="text-center py-8 text-[12px] text-black/40">لا توجد فروع</div>
          ) : (
            <div className="space-y-4">
              {branches.map((b: { id: string; name: string; applications: number; users: number }) => (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <div className="text-[13px] font-extrabold">{b.name}</div>
                      <div className="text-[10px] text-black/50">{b.users} موظف</div>
                    </div>
                    <div className="text-[16px] font-extrabold text-[#0d7a3e]">{b.applications}</div>
                  </div>
                  <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0d7a3e] rounded-full transition-all"
                      style={{ width: `${(b.applications / maxBranch) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-[20px] bg-white border border-black/5 p-5">
          <h2 className="font-extrabold text-[15px] flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#0d7a3e]" />
            أعلى الموظفين إنتاجية
          </h2>

          {topStaff.length === 0 ? (
            <div className="text-center py-8 text-[12px] text-black/40">لا توجد بيانات</div>
          ) : (
            <div className="space-y-2">
              {topStaff.map(
                (
                  s: { id: string; fullName: string; role: string; branch: string; completedCount: number },
                  i: number,
                ) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl bg-[#f9fbf9] border border-black/5 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0d7a3e] text-white grid place-items-center text-[12px] font-extrabold">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-[12px] font-bold">{s.fullName}</div>
                        <div className="text-[10px] text-black/50">{s.role} • {s.branch}</div>
                      </div>
                    </div>
                    <div className="text-[16px] font-extrabold text-[#0d7a3e]">{s.completedCount}</div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <div className="rounded-[20px] bg-white border border-black/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[15px] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0d7a3e]" />
              أحدث الطلبات
            </h2>
            <Link href="/portal/applications" className="text-[11px] font-bold text-[#0d7a3e]">
              عرض الكل ←
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="text-center py-8 text-[12px] text-black/40">لا توجد طلبات</div>
          ) : (
            <div className="space-y-2">
              {recentApplications.map(
                (a: {
                  id: string
                  trackingNumber: string
                  citizenName: string
                  branch: string
                  gov: string
                  submittedAt: string
                }) => (
                  <Link
                    key={a.id}
                    href={`/portal/applications/${a.id}`}
                    className="flex items-center justify-between rounded-xl hover:bg-[#f9fbf9] border border-transparent hover:border-black/5 p-3 transition"
                  >
                    <div>
                      <div className="font-mono text-[11px] font-bold text-[#0d7a3e]">{a.trackingNumber}</div>
                      <div className="text-[12px] font-bold mt-0.5">{a.citizenName}</div>
                      <div className="text-[10px] text-black/50">{a.gov} • {a.branch}</div>
                    </div>
                    <div className="text-[10px] text-black/40">
                      {new Date(a.submittedAt).toLocaleDateString('ar-EG')}
                    </div>
                  </Link>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  color,
}: {
  icon: typeof FileText
  label: string
  value: number
  suffix?: string
  color: string
}) {
  return (
    <div className="rounded-[18px] bg-white border border-black/5 p-4">
      <div className={`w-10 h-10 rounded-[12px] grid place-items-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="mt-3 text-[22px] font-extrabold">
        {value.toLocaleString('ar-EG')}
        {suffix && <span className="text-[13px] text-black/50 font-bold">{suffix}</span>}
      </div>
      <div className="text-[11px] text-black/55 font-bold">{label}</div>
    </div>
  )
}
