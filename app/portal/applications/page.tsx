'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Breadcrumbs from '@/components/Breadcrumbs'
import {
  CheckSquare,
  Eye,
  FileText,
  Filter,
  Loader2,
  Search,
  Square,
  UserPlus,
  X,
} from 'lucide-react'

const STAGES = ['', 'SUBMITTED', 'INITIAL_REVIEW', 'DOCS_REVIEW', 'SURVEY', 'PRICING', 'COMMITTEE', 'CONTRACT', 'COMPLETED', 'REJECTED']
const STATUSES = ['', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'REJECTED']
const STAGE_LABELS: Record<string, string> = {
  SUBMITTED: 'تم التقديم', INITIAL_REVIEW: 'مراجعة أولية', DOCS_REVIEW: 'فحص المستندات',
  SURVEY: 'معاينة ميدانية', PRICING: 'تسعير', COMMITTEE: 'عرض على اللجنة',
  CONTRACT: 'تعاقد', COMPLETED: 'منجز', REJECTED: 'مرفوض',
}
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'نشط', ON_HOLD: 'معلّق', COMPLETED: 'منجز', REJECTED: 'مرفوض',
}

type Row = {
  id: string
  trackingNumber: string
  stage: string
  status: string
  submittedAt: string
  citizen: { fullName: string; nationalId: string; phone: string }
  land: { gov: string | null; center: string | null; totalFaddan: number } | null
  rejectionReason: string | null
  assignedTo: { fullName: string } | null
  _count: { documents: number }
}

type Staff = { id: string; fullName: string; role: { key: string; nameAr: string } }

export default function ApplicationsListPage() {
  const [items, setItems] = useState<Row[]>([])
  const [q, setQ] = useState('')
  const [stage, setStage] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [staff, setStaff] = useState<Staff[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showAssign, setShowAssign] = useState(false)
  const [showStage, setShowStage] = useState(false)
  const [pickedStaff, setPickedStaff] = useState('')
  const [pickedStage, setPickedStage] = useState('')
  const [notes, setNotes] = useState('')
  const [isAdminOrManager, setIsAdminOrManager] = useState(false)

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: '1', pageSize: '50' })
    if (q) params.set('q', q)
    if (stage) params.set('stage', stage)
    if (status) params.set('status', status)
    try {
      const res = await fetch(`/api/staff/applications?${params}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items)
        setTotal(data.total)
        setSelected(new Set())
      }
    } finally {
      setLoading(false)
    }
  }

  const loadStaff = async () => {
    try {
      const res = await fetch('/api/staff/users/selectable')
      if (res.ok) {
        const users = await res.json()
        setStaff(users.filter((u: Staff) => u.role.key !== 'admin'))
      }
    } catch {}
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, status])

  useEffect(() => {
    void loadStaff()
  }, [])
  useEffect(() => {
    fetch('/api/auth/staff/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const role = d?.user?.roleKey
        setIsAdminOrManager(role === 'admin' || role === 'branch_manager')
      })
      .catch(() => {})
  }, [])

  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const toggleAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(items.map((i) => i.id)))
    }
  }

  const submitBulk = async (action: 'assign' | 'stage') => {
    setError('')
    setSuccess('')
    setActionLoading(true)

    try {
      const body: Record<string, unknown> = {
        ids: Array.from(selected),
        action,
        notes: notes || undefined,
      }
      if (action === 'assign') body.assignedToId = pickedStaff || null
      if (action === 'stage') body.toStage = pickedStage

      const res = await fetch('/api/staff/applications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'فشلت العملية')
        return
      }
      setSuccess(`تم تحديث ${data.updated} طلب`)
      setShowAssign(false)
      setShowStage(false)
      setPickedStaff('')
      setPickedStage('')
      setNotes('')
      await load()
    } catch {
      setError('تعذّر الاتصال')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <Breadcrumbs items={[{ label: 'الطلبات' }]} />
      <div>
        <h1 className="text-[22px] font-extrabold">الطلبات</h1>
        <p className="text-[12px] text-black/55 mt-1">
          إدارة ومتابعة طلبات التقنين ({total} طلب)
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] font-semibold p-3 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">×</button>
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 text-green-700 text-[13px] font-semibold p-3 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="font-bold">×</button>
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); void load() }}
        className="rounded-[18px] bg-white border border-black/5 p-4 grid md:grid-cols-[1fr_auto_auto_auto] gap-3"
      >
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-black/30" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث برقم التتبع / الاسم / الرقم القومي / المحافظة"
            className="input pr-10"
          />
        </div>
        <select value={stage} onChange={(e) => setStage(e.target.value)} className="input md:w-44">
          {STAGES.map((v) => <option key={v} value={v}>{v ? STAGE_LABELS[v] : 'كل المراحل'}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input md:w-36">
          {STATUSES.map((v) => <option key={v} value={v}>{v ? STATUS_LABELS[v] : 'كل الحالات'}</option>)}
        </select>
        <button className="h-11 px-6 rounded-full bg-[#0d7a3e] text-white font-bold text-[13px] flex items-center gap-2">
          <Filter className="w-4 h-4" /> تطبيق
        </button>
      </form>

      <div className="rounded-[18px] bg-white border border-black/5 overflow-hidden stagger-children">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#0d7a3e]" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 mx-auto text-black/20" />
            <div className="mt-3 text-[14px] font-bold">لا توجد طلبات</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-[#f9fbf9]">
                <tr>
                  <th className="text-right px-3 py-3 w-10">
                    <button type="button" onClick={toggleAll} className="text-black/60">
                      {selected.size === items.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  {[
                    'رقم التتبع','المواطن','الموقع','المساحة','المرحلة','الحالة',
                    ...(isAdminOrManager ? ['سبب الإيقاف'] : []),
                    'مسند إلى',''
                  ].map((h) => (
                    <th key={h} className="text-right px-4 py-3 font-bold text-black/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((app) => (
                  <tr key={app.id} className={`border-b border-black/5 ${selected.has(app.id) ? 'bg-[#f0faf4]' : 'hover:bg-[#f9fbf9]'}`}>
                    <td className="px-3 py-3">
                      <button type="button" onClick={() => toggleOne(app.id)} className="text-black/60">
                        {selected.has(app.id) ? <CheckSquare className="w-4 h-4 text-[#0d7a3e]" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#0d7a3e]">
                      {app.trackingNumber}
                      <div className="text-[10px] text-black/45">{new Date(app.submittedAt).toLocaleDateString('ar-EG')}</div>
                    </td>
                    <td className="px-4 py-3 font-bold">
                      {app.citizen.fullName}
                      <div className="text-[10px] text-black/45">{app.citizen.nationalId}</div>
                    </td>
                    <td className="px-4 py-3">
                      {app.land?.gov || '—'}
                      <div className="text-[10px] text-black/45">{app.land?.center}</div>
                    </td>
                    <td className="px-4 py-3 font-bold">{app.land?.totalFaddan?.toFixed(2) || '0'} ف</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-[#0d7a3e]/10 text-[#0d7a3e] font-bold">
                        {STAGE_LABELS[app.stage] || app.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-bold">
                        {STATUS_LABELS[app.status] || app.status}
                      </span>
                    </td>
                    {isAdminOrManager && (
                      <td className="px-4 py-3 max-w-[200px]">
                        {app.rejectionReason ? (
                          <span className="text-[11px] text-amber-700 font-semibold line-clamp-2" title={app.rejectionReason}>
                            {app.rejectionReason}
                          </span>
                        ) : (
                          <span className="text-black/30">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">{app.assignedTo?.fullName || 'غير مسند'}</td>
                    <td className="px-4 py-3">
                      <Link href={`/portal/applications/${app.id}`} className="w-8 h-8 rounded-full bg-[#0d7a3e]/10 grid place-items-center text-[#0d7a3e]">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:right-auto md:left-4 md:w-[600px] z-40 rounded-[18px] bg-[#0a0f0d] text-white p-4 shadow-2xl flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#c89a2c] text-black font-extrabold grid place-items-center text-[13px]">
              {selected.size}
            </div>
            <span className="text-[13px] font-bold">طلب محدد</span>
          </div>
          <div className="h-6 w-px bg-white/20" />
          <button
            onClick={() => setShowAssign(true)}
            className="h-9 px-4 rounded-full bg-white/10 hover:bg-white/20 font-bold text-[12px] flex items-center gap-2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            تعيين لموظف
          </button>
          <button
            onClick={() => setShowStage(true)}
            className="h-9 px-4 rounded-full bg-white/10 hover:bg-white/20 font-bold text-[12px] flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            نقل مرحلة
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="h-9 px-4 rounded-full bg-white/5 hover:bg-white/15 font-bold text-[12px] flex items-center gap-2 ms-auto"
          >
            <X className="w-3.5 h-3.5" />
            إلغاء
          </button>
        </div>
      )}

      {showAssign && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] w-full max-w-md p-5">
            <h3 className="font-extrabold text-[16px] mb-4">تعيين {selected.size} طلب لموظف</h3>
            <select
              value={pickedStaff}
              onChange={(e) => setPickedStaff(e.target.value)}
              className="input mb-3"
            >
              <option value="">— بدون تعيين —</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.role.nameAr})</option>
              ))}
            </select>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input mb-4"
              placeholder="ملاحظات (اختياري)"
            />
            <div className="flex gap-2">
              <button
                onClick={() => void submitBulk('assign')}
                disabled={actionLoading}
                className="flex-1 h-11 rounded-full bg-[#0d7a3e] text-white font-bold text-[13px] disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'تعيين'}
              </button>
              <button
                onClick={() => setShowAssign(false)}
                className="h-11 px-5 rounded-full border border-black/10 font-bold text-[13px]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {showStage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] w-full max-w-md p-5">
            <h3 className="font-extrabold text-[16px] mb-4">نقل {selected.size} طلب لمرحلة</h3>
            <select
              value={pickedStage}
              onChange={(e) => setPickedStage(e.target.value)}
              className="input mb-3"
            >
              <option value="">— اختر المرحلة —</option>
              {Object.entries(STAGE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input mb-4"
              placeholder="ملاحظات (اختياري)"
            />
            <div className="flex gap-2">
              <button
                onClick={() => void submitBulk('stage')}
                disabled={actionLoading || !pickedStage}
                className="flex-1 h-11 rounded-full bg-[#0d7a3e] text-white font-bold text-[13px] disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'نقل'}
              </button>
              <button
                onClick={() => setShowStage(false)}
                className="h-11 px-5 rounded-full border border-black/10 font-bold text-[13px]"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
