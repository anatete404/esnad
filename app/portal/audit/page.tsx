'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  Filter,
  Loader2,
  Search,
  Shield,
  User as UserIcon,
} from 'lucide-react'

type AuditEntry = {
  id: string
  action: string
  entity: string
  entityId: string | null
  oldValue: string | null
  newValue: string | null
  ip: string | null
  userAgent: string | null
  branchId: string | null
  actorBranchId: string | null
  createdAt: string
  user: {
    id: string
    fullName: string
    email: string
    employeeNumber?: string | null
  } | null
  branch: { id: string; name: string } | null
  actorBranch: { id: string; name: string } | null
}
const ACTION_COLORS: Record<string, string> = {
  CITIZEN_REGISTER: 'bg-blue-50 text-blue-700 border-blue-200',
  APPLICATION_CREATE: 'bg-green-50 text-green-700 border-green-200',
  APPLICATION_STAGE_CHANGE: 'bg-purple-50 text-purple-700 border-purple-200',
  APPLICATION_ASSIGN: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DOCUMENT_UPLOAD: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  DOCUMENT_VERIFY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DOCUMENT_UNVERIFY: 'bg-amber-50 text-amber-700 border-amber-200',
  USER_CREATE: 'bg-teal-50 text-teal-700 border-teal-200',
  USER_UPDATE: 'bg-sky-50 text-sky-700 border-sky-200',
  USER_DELETE: 'bg-red-50 text-red-700 border-red-200',
  LOGIN_SUCCESS: 'bg-[#0d7a3e]/10 text-[#0d7a3e] border-[#0d7a3e]/20',
  LOGIN_FAILED: 'bg-red-50 text-red-700 border-red-200',
}

export default function AuditLogPage() {
  const [items, setItems] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [entity, setEntity] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [expanded, setExpanded] = useState<string | null>(null)
  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '50' })
      if (q) params.set('action', q)
      if (entity) params.set('entity', entity)
      const res = await fetch(`/api/staff/audit?${params}`)
      if (res.ok) {
        const d = await res.json()
        setItems(d.items)
        setTotalPages(d.totalPages)
        setTotal(d.total)
      }
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
  }, [page, entity])
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-extrabold flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#0d7a3e]" />
          سجل التدقيق
        </h1>
        <p className="text-[12px] text-black/55 mt-1">
          سجل كامل لكل الإجراءات ({total} سجل)
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setPage(1)
          void load()
        }}
        className="rounded-[18px] bg-white border border-black/5 p-4 grid md:grid-cols-[1fr_auto_auto] gap-3"
      >
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-black/30" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بنوع الإجراء"
            className="input pr-10"
          />
        </div>
        <select
          value={entity}
          onChange={(e) => {
            setEntity(e.target.value)
            setPage(1)
          }}
          className="input md:w-44"
        >
          <option value="">كل الكيانات</option>
          <option value="Application">الطلبات</option>
          <option value="Document">المستندات</option>
          <option value="User">الموظفون</option>
          <option value="Citizen">المواطنون</option>
        </select>
        <button className="h-11 px-6 rounded-full bg-[#0d7a3e] text-white font-bold flex items-center gap-2">
          <Filter className="w-4 h-4" />
          بحث
        </button>
      </form>
      <div className="rounded-[18px] bg-white border border-black/5 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#0d7a3e]" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Activity className="w-10 h-10 mx-auto text-black/20" />
            <div className="mt-3 font-bold">لا توجد سجلات</div>
          </div>
        ) : (
          <>
            {items.map((log) => (
              <div key={log.id} className="p-4 border-b border-black/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Activity className="w-9 h-9 p-2 rounded-[10px] bg-[#0d7a3e]/10 text-[#0d7a3e]" />
                    <div>
                      <div className="flex gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ACTION_COLORS[log.action] || 'bg-black/5'}`}
                        >
                          {log.action}
                        </span>
                        <span className="text-[11px] text-black/50">
                          {log.entity}
                        </span>
                        {log.entityId && (
                          <span className="font-mono text-[10px]">
                            #{log.entityId.slice(0, 8)}
                          </span>
                        )}
                        {log.branch && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {log.branch.name}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex gap-3 text-[11px] text-black/60">
                        {log.user ? (
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {log.user.fullName}
                            {log.user.employeeNumber && (
                              <span className="text-xs text-black/50">
                                {log.user.employeeNumber}
                              </span>
                            )}
                            {log.actorBranch && log.actorBranch.id !== log.branch?.id && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                {log.actorBranch.name}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span>نظام</span>
                        )}
                        <span>
                          {new Date(log.createdAt).toLocaleString('ar-EG')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {(log.oldValue || log.newValue) && (
                    <button
                      onClick={() =>
                        setExpanded(expanded === log.id ? null : log.id)
                      }
                      className="text-[11px] font-bold text-[#0d7a3e]"
                    >
                      {expanded === log.id ? 'إخفاء' : 'التفاصيل'}
                    </button>
                  )}
                </div>
                {expanded === log.id && (
                  <div className="mt-3 grid md:grid-cols-2 gap-3">
                    <Value
                      title="القيمة القديمة"
                      value={log.oldValue}
                      color="red"
                    />
                    <Value
                      title="القيمة الجديدة"
                      value={log.newValue}
                      color="green"
                    />
                  </div>
                )}
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex justify-between px-4 py-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  السابق
                </button>
                <span>
                  صفحة {page} من {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
function Value({
  title,
  value,
  color,
}: {
  title: string
  value: string | null
  color: string
}) {
  if (!value) return null
  let formatted = value
  try {
    formatted = JSON.stringify(JSON.parse(value), null, 2)
  } catch {}
  return (
    <div
      className={`rounded-xl bg-${color}-50/50 border border-${color}-100 p-3`}
    >
      <div className={`text-[10px] font-bold text-${color}-600 mb-1`}>
        {title}
      </div>
      <pre className="text-[10px] whitespace-pre-wrap break-words font-mono">
        {formatted}
      </pre>
    </div>
  )
}
