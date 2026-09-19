import { Activity, AlertCircle, CheckCircle2, Clock, FileText, TrendingUp, Users } from 'lucide-react'
import { redirect } from 'next/navigation'
import Breadcrumbs from '@/components/Breadcrumbs'
import ExportButton from '@/components/ExportButton'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can, scopeWhere } from '@/lib/rbac'

const STAGE_LABELS: Record<string, string> = { SUBMITTED: 'تم التقديم', INITIAL_REVIEW: 'مراجعة أولية', DOCS_REVIEW: 'فحص المستندات', SURVEY: 'معاينة ميدانية', PRICING: 'تسعير', COMMITTEE: 'عرض على اللجنة', CONTRACT: 'تعاقد', COMPLETED: 'منجز', REJECTED: 'مرفوض' }

export default async function ReportsPage() {
  const session = await getUserSession()
  if (!session) redirect('/portal/login')
  if (!can(session, 'reports.view')) return <div className="rounded-[20px] bg-amber-50 border border-amber-200 p-6 text-center"><AlertCircle className="w-10 h-10 text-amber-600 mx-auto" /><div className="mt-3 font-extrabold text-amber-900">لا تملك صلاحية عرض التقارير</div></div>
  const where = scopeWhere(session, 'BRANCH')
  const [totalApplications, completedCount, rejectedCount, activeCount, onHoldCount, durations, stages, monthly, citizensCount, topStaff] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.count({ where: { ...where, status: 'COMPLETED' } }),
    prisma.application.count({ where: { ...where, status: 'REJECTED' } }),
    prisma.application.count({ where: { ...where, status: 'ACTIVE' } }),
    prisma.application.count({ where: { ...where, status: 'ON_HOLD' } }),
    prisma.application.findMany({ where: { ...where, status: 'COMPLETED', completedAt: { not: null } }, select: { submittedAt: true, completedAt: true }, take: 200 }),
    prisma.application.groupBy({ by: ['stage'], where, _count: { _all: true } }),
    prisma.$queryRaw<Array<{ month: string; count: number }>>`SELECT TO_CHAR("submittedAt", 'YYYY-MM') as month, COUNT(*)::int as count FROM "Application" GROUP BY month ORDER BY month DESC LIMIT 6`,
    prisma.citizen.count(),
    prisma.user.findMany({ where: { isActive: true }, select: { id: true, fullName: true, role: { select: { nameAr: true } }, _count: { select: { assignedApps: true } } }, orderBy: { assignedApps: { _count: 'desc' } }, take: 5 }),
  ])
  const avgDuration = durations.length ? Math.round(durations.reduce((sum, a) => sum + (a.completedAt ? new Date(a.completedAt).getTime() - new Date(a.submittedAt).getTime() : 0), 0) / durations.length / 86400000) : 0
  const completionRate = totalApplications ? Math.round(completedCount / totalApplications * 100) : 0
  const maxStage = Math.max(...stages.map((s) => s._count._all), 1)
  return <div className="space-y-6"><Breadcrumbs items={[{ label: 'التقارير' }]} /><div className="flex items-start justify-between gap-3 flex-wrap"><div><h1 className="text-[22px] font-extrabold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#0d7a3e]" />التقارير والإحصائيات</h1><p className="text-[12px] text-black/55 mt-1">لوحة مؤشرات الأداء الحقيقية من قاعدة البيانات</p></div><div className="flex flex-wrap gap-2 justify-end"><ExportButton href="/api/staff/reports/export/applications" label="تصدير الطلبات" /><ExportButton href="/api/staff/reports/export/payments" label="تصدير المدفوعات" /><ExportButton href="/api/staff/reports/export/appeals" label="تصدير التظلمات" /></div></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Kpi icon={FileText} label="إجمالي الطلبات" value={String(totalApplications)} color="bg-blue-50 text-blue-600" /><Kpi icon={CheckCircle2} label="مكتملة" value={`${completedCount} (${completionRate}%)`} color="bg-green-50 text-green-600" /><Kpi icon={Clock} label="متوسط مدة الإنجاز" value={`${avgDuration} يوم`} color="bg-purple-50 text-purple-600" /><Kpi icon={Users} label="المواطنون المسجلون" value={String(citizensCount)} color="bg-amber-50 text-amber-600" /></div><div className="grid grid-cols-3 gap-4"><Status label="نشطة" value={activeCount} color="text-blue-600" /><Status label="معلّقة" value={onHoldCount} color="text-amber-600" /><Status label="مرفوضة" value={rejectedCount} color="text-red-600" /></div><div className="grid lg:grid-cols-2 gap-6"><Panel title="توزيع الطلبات حسب المرحلة" icon={Activity}>{stages.length === 0 ? <Empty /> : stages.sort((a, b) => b._count._all - a._count._all).map((s) => <Bar key={s.stage} label={STAGE_LABELS[s.stage] || s.stage} value={s._count._all} max={maxStage} />)}</Panel><Panel title="آخر 6 أشهر" icon={TrendingUp}>{monthly.length === 0 ? <Empty /> : monthly.map((m) => <Bar key={m.month} label={m.month} value={Number(m.count)} max={Math.max(...monthly.map((x) => Number(x.count)), 1)} gold />)}</Panel><Panel title="أعلى الموظفين إنتاجية" icon={Users}>{topStaff.length === 0 ? <Empty /> : topStaff.map((s) => <div key={s.id} className="flex justify-between rounded-xl bg-[#f9fbf9] p-3"><div><div className="font-bold text-[12px]">{s.fullName}</div><div className="text-[10px] text-black/50">{s.role.nameAr}</div></div><div className="font-extrabold text-[#0d7a3e]">{s._count.assignedApps}</div></div>)}</Panel></div></div>
}
function Kpi({ icon: Icon, label, value, color }: { icon: typeof FileText; label: string; value: string; color: string }) { return <div className="rounded-[18px] bg-white border border-black/5 p-4"><div className={`w-10 h-10 rounded-[12px] grid place-items-center ${color}`}><Icon className="w-5 h-5" /></div><div className="mt-3 text-[20px] font-extrabold">{value}</div><div className="text-[11px] text-black/55 font-bold">{label}</div></div> }
function Status({ label, value, color }: { label: string; value: number; color: string }) { return <div className="rounded-[16px] bg-white border border-black/5 p-4 flex justify-between"><span className="font-bold text-black/70">{label}</span><b className={`text-[22px] ${color}`}>{value}</b></div> }
function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Activity; children: React.ReactNode }) { return <div className="rounded-[20px] bg-white border border-black/5 p-5"><h2 className="font-extrabold text-[15px] flex items-center gap-2 mb-4"><Icon className="w-4 h-4 text-[#0d7a3e]" />{title}</h2><div className="space-y-3">{children}</div></div> }
function Bar({ label, value, max, gold }: { label: string; value: number; max: number; gold?: boolean }) { return <div><div className="flex justify-between text-[12px] font-bold mb-1.5"><span>{label}</span><span className="text-black/50">{value}</span></div><div className="h-2 bg-black/5 rounded-full overflow-hidden"><div className={`h-full rounded-full ${gold ? 'bg-[#c89a2c]' : 'bg-[#0d7a3e]'}`} style={{ width: `${value / max * 100}%` }} /></div></div> }
function Empty() { return <div className="text-center py-8 text-[12px] text-black/40">لا توجد بيانات</div> }
