'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Loader2,
} from 'lucide-react'

type Task = {
  id: string
  type: string
  title: string
  subtitle: string
  href: string
  priority: 'high' | 'normal'
}

type Stats = Record<string, number | string>

const STAT_LABELS: Record<string, string> = {
  newApplications: 'طلبات جديدة',
  incompleteDocs: 'مستندات ناقصة',
  assignedToMe: 'مسند إليك',
  unassigned: 'بدون إسناد',
  docsToVerify: 'مستندات للمراجعة',
  scheduled: 'معاينات مجدولة',
  completed: 'معاينات مكتملة',
  readyForContract: 'عقود جاهزة',
  unsignedContracts: 'عقود غير موقعة',
  recentPayments: 'دفعات حديثة',
  totalThisMonth: 'إجمالي الشهر',
  pendingAppeals: 'تظلمات معلقة',
  activeInBranch: 'نشط في الفرع',
  totalApplications: 'إجمالي الطلبات',
  activeApplications: 'طلبات نشطة',
  activeUsers: 'موظفون نشطون',
  todayAttendance: 'حضور اليوم',
  monthAttendanceDays: 'أيام الحضور هذا الشهر',
}

export default function MyTasksCard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<Stats>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/staff/my-tasks')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setTasks(d.tasks || [])
          setStats(d.stats || {})
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="rounded-[20px] bg-white border border-black/5 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#0d7a3e]" />
        </div>
      </div>
    )
  }

  const statEntries = Object.entries(stats).filter(
    ([, value]) => typeof value === 'number' || typeof value === 'string',
  )

  return (
    <div className="rounded-[20px] bg-white border border-black/5 overflow-hidden">
      <div className="bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] text-white p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-white/15 grid place-items-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-[15px]">مهامي اليوم</div>
            <div className="text-[11px] opacity-85">
              {tasks.length > 0
                ? `لديك ${tasks.length} مهمة تحتاج إجراء`
                : 'لا توجد مهام معلقة حالياً'}
            </div>
          </div>
        </div>
      </div>

      {statEntries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-b border-black/5">
          {statEntries.map(([key, value]) => (
            <div key={key} className="rounded-xl bg-[#f9fbf9] border border-black/5 p-3 text-center">
              <div className="text-[20px] font-extrabold text-[#0d7a3e]">
                {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
              </div>
              <div className="text-[10px] text-black/55 font-bold mt-0.5">
                {STAT_LABELS[key] || key}
              </div>
            </div>
          ))}
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-10">
          <CheckCircle2 className="w-10 h-10 mx-auto text-green-500" />
          <div className="mt-3 text-[14px] font-bold">مفيش مهام معلقة</div>
          <div className="mt-1 text-[12px] text-black/55">
            كل حاجة تحت السيطرة — عمل رائع!
          </div>
        </div>
      ) : (
        <div className="divide-y divide-black/5">
          {tasks.slice(0, 8).map((task) => (
            <Link
              key={`${task.type}-${task.id}`}
              href={task.href}
              className="flex items-center gap-3 p-4 hover:bg-[#f9fbf9] transition group"
            >
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  task.priority === 'high' ? 'bg-red-500' : 'bg-amber-400'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-black truncate">
                  {task.title}
                </div>
                <div className="text-[11px] text-black/55 truncate mt-0.5">
                  {task.subtitle}
                </div>
              </div>
              <ArrowLeft className="w-4 h-4 text-black/30 shrink-0 group-hover:text-[#0d7a3e] group-hover:-translate-x-0.5 transition" />
            </Link>
          ))}
          {tasks.length > 8 && (
            <div className="p-3 text-center text-[11px] text-black/50">
              + {tasks.length - 8} مهمة إضافية
            </div>
          )}
        </div>
      )}
    </div>
  )
}
