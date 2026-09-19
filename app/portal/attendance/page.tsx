'use client'

import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  Timer,
} from 'lucide-react'

type Attendance = {
  id: string
  checkInAt: string
  checkOutAt: string | null
  durationMinutes: number | null
  notes: string | null
  user: {
    id: string
    fullName: string
    role: { nameAr: string }
    branch: { name: string } | null
  }
}

type Session = {
  id: string
  fullName: string
  email: string
  roleKey: string
}

function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '—'
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours === 0) return `${remainingMinutes} دقيقة`
  if (remainingMinutes === 0) return `${hours} ساعة`
  return `${hours}س ${remainingMinutes}د`
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AttendancePage() {
  const [items, setItems] = useState<Attendance[]>([])
  const [activeSession, setActiveSession] = useState<Attendance | null>(null)
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [session, setSession] = useState<Session | null>(null)
  const [scope, setScope] = useState<'my' | 'all'>('my')
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [tick, setTick] = useState(Date.now())

  const load = async () => {
    setLoading(true)
    try {
      const [attendanceResponse, meResponse] = await Promise.all([
        fetch(`/api/staff/attendance?scope=${scope}`),
        fetch('/api/auth/staff/me'),
      ])
      if (attendanceResponse.ok) {
        const data = await attendanceResponse.json()
        setItems(data.items || [])
        setActiveSession(data.activeSession || null)
        setTodayMinutes(data.todayMinutes || 0)
      }
      if (meResponse.ok) {
        const data = await meResponse.json()
        setSession(data.user)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope])

  useEffect(() => {
    if (!activeSession) return
    const interval = setInterval(() => setTick(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [activeSession])

  const checkIn = async () => {
    setActing(true)
    setError('')
    setSuccess('')
    try {
      const response = await fetch('/api/staff/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'فشل تسجيل الحضور')
        return
      }
      setSuccess('تم تسجيل الحضور بنجاح')
      await load()
    } catch {
      setError('تعذّر الاتصال')
    } finally {
      setActing(false)
    }
  }

  const checkOut = async () => {
    setActing(true)
    setError('')
    setSuccess('')
    try {
      const response = await fetch('/api/staff/attendance/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'فشل تسجيل الانصراف')
        return
      }
      setSuccess('تم تسجيل الانصراف بنجاح')
      await load()
    } catch {
      setError('تعذّر الاتصال')
    } finally {
      setActing(false)
    }
  }

  const now = new Date(tick)
  const activeElapsed = activeSession
    ? Math.max(1, Math.round((now.getTime() - new Date(activeSession.checkInAt).getTime()) / 60000))
    : 0
  const canSeeAll = session?.roleKey === 'admin' || session?.roleKey === 'branch_manager'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0d7a3e]" />
            الحضور والانصراف
          </h1>
          <p className="text-[12px] text-black/55 mt-1">
            {scope === 'my' ? 'سجل حضورك الشخصي' : 'سجل حضور الفريق'}
          </p>
        </div>

        {canSeeAll && (
          <div className="flex gap-1 p-1 rounded-full bg-black/5">
            <button
              onClick={() => setScope('my')}
              className={`h-8 px-4 rounded-full text-[12px] font-bold transition ${
                scope === 'my' ? 'bg-white shadow-sm' : 'text-black/60'
              }`}
            >
              سجلي
            </button>
            <button
              onClick={() => setScope('all')}
              className={`h-8 px-4 rounded-full text-[12px] font-bold transition ${
                scope === 'all' ? 'bg-white shadow-sm' : 'text-black/60'
              }`}
            >
              الفريق
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] font-semibold p-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </span>
          <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 text-green-700 text-[13px] font-semibold p-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {success}
          </span>
          <button onClick={() => setSuccess('')} className="font-bold">×</button>
        </div>
      )}

      <div className={`rounded-[20px] p-6 ${
        activeSession
          ? 'bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] text-white'
          : 'bg-white border border-black/5'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {activeSession ? (
              <>
                <div className="text-[12px] opacity-85">أنت الآن في العمل</div>
                <div className="mt-2 text-[32px] font-extrabold font-mono" dir="ltr">
                  {String(Math.floor(activeElapsed / 60)).padStart(2, '0')}:
                  {String(activeElapsed % 60).padStart(2, '0')}
                </div>
                <div className="mt-2 text-[12px] opacity-85">بدأت من {formatTime(activeSession.checkInAt)}</div>
              </>
            ) : (
              <>
                <div className="text-[12px] text-black/55">الحالة الحالية</div>
                <div className="mt-1 text-[20px] font-extrabold">خارج العمل</div>
                <div className="mt-1 text-[12px] text-black/55">مجموع اليوم: {formatDuration(todayMinutes)}</div>
              </>
            )}
          </div>

          <div>
            {activeSession ? (
              <button
                onClick={checkOut}
                disabled={acting}
                className="h-12 px-8 rounded-full bg-white text-[#0d7a3e] font-bold text-[14px] flex items-center gap-2 disabled:opacity-60 hover:bg-white/90 transition"
              >
                {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogOut className="w-4 h-4" /> تسجيل الانصراف</>}
              </button>
            ) : (
              <button
                onClick={checkIn}
                disabled={acting}
                className="h-12 px-8 rounded-full bg-[#0d7a3e] text-white font-bold text-[14px] flex items-center gap-2 disabled:opacity-60 hover:bg-[#0a5c2f] transition"
              >
                {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogIn className="w-4 h-4" /> تسجيل الحضور</>}
              </button>
            )}
          </div>
        </div>

        {activeSession && (
          <div className="mt-5 pt-5 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
            <div className="rounded-xl bg-white/10 p-3"><div className="opacity-70">بدأت</div><div className="mt-1 font-extrabold">{formatTime(activeSession.checkInAt)}</div></div>
            <div className="rounded-xl bg-white/10 p-3"><div className="opacity-70">الوقت الحالي</div><div className="mt-1 font-extrabold">{now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div></div>
            <div className="rounded-xl bg-white/10 p-3"><div className="opacity-70">مدة الجلسة</div><div className="mt-1 font-extrabold">{formatDuration(activeElapsed)}</div></div>
            <div className="rounded-xl bg-white/10 p-3"><div className="opacity-70">إجمالي اليوم</div><div className="mt-1 font-extrabold">{formatDuration(todayMinutes + activeElapsed)}</div></div>
          </div>
        )}
      </div>

      {!activeSession && todayMinutes > 0 && (
        <div className="rounded-[16px] bg-[#f0faf4] border border-[#0d7a3e]/20 p-4 flex items-center gap-3">
          <Timer className="w-5 h-5 text-[#0d7a3e] shrink-0" />
          <div className="text-[13px] text-[#0d5a2e] font-semibold">مجموع ساعات اليوم: <strong>{formatDuration(todayMinutes)}</strong></div>
        </div>
      )}

      <div className="rounded-[18px] bg-white border border-black/5 overflow-hidden">
        <div className="p-4 border-b border-black/5">
          <h2 className="font-extrabold text-[14px] flex items-center gap-2"><Clock className="w-4 h-4 text-[#0d7a3e]" /> سجل الحضور</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#0d7a3e]" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-10 h-10 mx-auto text-black/20" />
            <div className="mt-3 text-[14px] font-bold">لا يوجد سجل حضور</div>
            <div className="mt-1 text-[12px] text-black/55">ابدأ يومك بتسجيل الحضور</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-[#f9fbf9] border-b border-black/5">
                <tr>
                  {scope === 'all' && <th className="text-right px-4 py-3 font-bold text-black/60">الموظف</th>}
                  <th className="text-right px-4 py-3 font-bold text-black/60">التاريخ</th>
                  <th className="text-right px-4 py-3 font-bold text-black/60">الحضور</th>
                  <th className="text-right px-4 py-3 font-bold text-black/60">الانصراف</th>
                  <th className="text-right px-4 py-3 font-bold text-black/60">المدة</th>
                  <th className="text-right px-4 py-3 font-bold text-black/60">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {items.map((attendance) => {
                  const isOpen = !attendance.checkOutAt
                  return (
                    <tr key={attendance.id} className="border-b border-black/5 hover:bg-[#f9fbf9]">
                      {scope === 'all' && (
                        <td className="px-4 py-3"><div className="font-bold">{attendance.user.fullName}</div><div className="text-[10px] text-black/50">{attendance.user.role.nameAr}{attendance.user.branch && ` • ${attendance.user.branch.name}`}</div></td>
                      )}
                      <td className="px-4 py-3">{new Date(attendance.checkInAt).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: '2-digit' })}</td>
                      <td className="px-4 py-3 font-mono font-bold text-[#0d7a3e]">{formatTime(attendance.checkInAt)}</td>
                      <td className="px-4 py-3 font-mono">{attendance.checkOutAt ? formatTime(attendance.checkOutAt) : '—'}</td>
                      <td className="px-4 py-3 font-bold">{attendance.durationMinutes != null ? formatDuration(attendance.durationMinutes) : isOpen ? <span className="text-amber-600">جاري</span> : '—'}</td>
                      <td className="px-4 py-3">{isOpen ? <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">نشط</span> : <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold">منتهي</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
