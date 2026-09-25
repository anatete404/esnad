'use client'

import { useEffect, useState } from 'react'
import {
  Loader2,
  Pencil,
  Trash2,
  X,
  Search,
  CheckCircle2,
  XCircle,
  UserPlus,
  Save,
} from 'lucide-react'

type Role = {
  id: string
  key: string
  nameAr: string
  permissionsCount: number
  isSystem: boolean
}
type Branch = { id: string; name: string; city: string | null }
type User = {
  id: string
  email: string
  fullName: string
  phone: string | null
  nationalId?: string | null
  isActive: boolean
  terminatedAt?: string | null
  terminationReason?: string | null
  lastLoginAt: string | null
  createdAt: string
  role: { key: string; nameAr: string }
  branch: { id: string; name: string } | null
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'inactive' | 'terminated'
  >('all')
  const [session, setSession] = useState<{ roleKey: string } | null>(null)
  const [terminateModal, setTerminateModal] = useState<{
    open: boolean
    user: User | null
  }>({ open: false, user: null })
  const [terminationReason, setTerminationReason] = useState('')
  const isAdmin = session?.roleKey === 'admin'
  const load = async () => {
    setLoading(true)
    try {
      const [uRes, rRes] = await Promise.all([
        fetch('/api/staff/users'),
        fetch('/api/staff/roles'),
      ])
      if (uRes.ok) setUsers((await uRes.json()).users)
      if (rRes.ok) {
        const d = await rRes.json()
        setRoles(d.roles)
        setBranches(d.branches)
      }
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
  }, [])
  useEffect(() => {
    fetch('/api/auth/staff/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.user?.roleKey) setSession({ roleKey: d.user.roleKey })
      })
      .catch(() => {})
  }, [])
  const action = async (user: User, method: string, body?: unknown) => {
    setError('')
    try {
      const res = await fetch(`/api/staff/users/${user.id}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      const d = await res.json()
      if (!res.ok) {
        setError(d.error || 'فشل العملية')
        return
      }
      setSuccess(
        method === 'DELETE'
          ? 'تم حذف الموظف'
          : user.isActive
            ? 'تم تعطيل الحساب'
            : 'تم تفعيل الحساب'
      )
      void load()
    } catch {
      setError('تعذّر الاتصال')
    }
  }
  const handleTerminate = async () => {
    if (!terminateModal.user) return
    setError('')
    try {
      const res = await fetch(`/api/staff/users/${terminateModal.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: false,
          terminatedAt: new Date().toISOString(),
          terminationReason: terminationReason.trim() || undefined,
        }),
      })
      const d = await res.json()
      if (!res.ok) {
        setError(d.error || 'فشل إنهاء الخدمة')
        return
      }
      setTerminateModal({ open: false, user: null })
      setTerminationReason('')
      setSuccess('تم إنهاء خدمة الموظف')
      await load()
    } catch {
      setError('تعذّر الاتصال')
    }
  }
  const filtered = users.filter((u) => {
    const query = q.toLowerCase()
    const matchesSearch =
      !query ||
      `${u.fullName} ${u.email} ${u.phone || ''} ${u.nationalId || ''}`
        .toLowerCase()
        .includes(query)
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && u.isActive && !u.terminatedAt) ||
      (filterStatus === 'inactive' && !u.isActive && !u.terminatedAt) ||
      (filterStatus === 'terminated' && !!u.terminatedAt)
    return matchesSearch && matchesStatus
  })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold">إدارة المستخدمين</h1>
          <p className="text-[12px] text-black/55 mt-1">
            {users.length} موظف في النظام
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setShowModal(true)
          }}
          className="h-11 px-6 rounded-full bg-[#0d7a3e] text-white font-bold flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          إضافة موظف
        </button>
      </div>
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 p-3">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 text-green-700 p-3">
          {success}
        </div>
      )}
      <div className="rounded-[18px] bg-white border border-black/5 p-4 relative">
        <Search className="absolute top-1/2 -translate-y-1/2 right-7 w-4 h-4 text-black/30" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث بالاسم / البريد / الهاتف / الرقم القومي"
          className="input pr-10"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'الكل' },
          { key: 'active', label: 'نشط' },
          { key: 'inactive', label: 'معطل' },
          { key: 'terminated', label: 'منتهي' },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() =>
              setFilterStatus(
                filter.key as 'all' | 'active' | 'inactive' | 'terminated'
              )
            }
            className={`h-9 px-4 rounded-full text-[12px] font-bold ${
              filterStatus === filter.key
                ? 'bg-[#0d7a3e] text-white'
                : 'bg-white border border-black/10 text-black/60'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="rounded-[18px] bg-white border border-black/5 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#0d7a3e]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-[#f9fbf9]">
                <tr>
                  {[
                    'الاسم',
                    'الرقم القومي',
                    'البريد',
                    'الدور',
                    'الفرع',
                    'الحالة',
                    'آخر دخول',
                    '',
                  ].map((h) => (
                    <th key={h} className="text-right px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-black/5">
                    <td className="px-4 py-3 font-bold">
                      {u.fullName}
                      <div className="text-[10px] text-black/50">{u.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {u.nationalId || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full bg-[#0d7a3e]/10 text-[#0d7a3e]">
                        {u.role.nameAr}
                      </span>
                    </td>
                    <td className="px-4 py-3">{u.branch?.name || '—'}</td>
                    <td className="px-4 py-3">
                      {u.terminatedAt ? (
                        <span className="text-red-600">
                          <XCircle className="inline w-3 h-3" /> منتهي
                        </span>
                      ) : u.isActive ? (
                        <span className="text-green-600">
                          <CheckCircle2 className="inline w-3 h-3" /> نشط
                        </span>
                      ) : (
                        <span className="text-yellow-600">
                          <XCircle className="inline w-3 h-3" /> معطّل
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleDateString('ar-EG')
                        : 'لم يدخل بعد'}
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <button
                        onClick={() => {
                          setEditing(u)
                          setShowModal(true)
                        }}
                        className="w-8 h-8 rounded-full bg-black/5 grid place-items-center"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          void action(u, 'PATCH', { isActive: !u.isActive })
                        }
                        className="w-8 h-8 rounded-full bg-amber-50 grid place-items-center"
                      >
                        {u.isActive ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      {isAdmin && !u.terminatedAt && (
                        <button
                          onClick={() =>
                            setTerminateModal({ open: true, user: u })
                          }
                          className="h-8 px-3 rounded-full bg-red-50 text-red-600 text-[11px] font-bold"
                        >
                          إنهاء الخدمة
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            if (confirm(`هل تريد حذف "${u.fullName}"؟`))
                              void action(u, 'DELETE')
                          }}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-600 grid place-items-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showModal && (
        <UserModal
          user={editing}
          roles={roles}
          branches={branches}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false)
            setSuccess(editing ? 'تم تحديث بيانات الموظف' : 'تم إنشاء الموظف')
            void load()
          }}
        />
      )}
      {terminateModal.open && terminateModal.user && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] w-full max-w-lg">
            <div className="p-5 border-b flex justify-between">
              <b>إنهاء خدمة: {terminateModal.user.fullName}</b>
              <button
                onClick={() => {
                  setTerminateModal({ open: false, user: null })
                  setTerminationReason('')
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <label className="block text-[12px] font-bold">
                سبب الإنهاء (اختياري)
                <textarea
                  value={terminationReason}
                  onChange={(e) => setTerminationReason(e.target.value)}
                  placeholder="مثال: استقالة، انتهاء عقد"
                  className="input mt-2 min-h-24"
                />
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTerminateModal({ open: false, user: null })
                    setTerminationReason('')
                  }}
                  className="flex-1 h-11 rounded-full border"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => void handleTerminate()}
                  className="flex-1 h-11 rounded-full bg-red-600 text-white font-bold"
                >
                  تأكيد الإنهاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserModal({
  user,
  roles,
  branches,
  onClose,
  onSaved,
}: {
  user: User | null
  roles: Role[]
  branches: Branch[]
  onClose: () => void
  onSaved: () => void
}) {
  const edit = !!user
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nationalId: user?.nationalId || '',
    password: '',
    roleKey: user?.role.key || 'receptionist',
    branchId: user?.branch?.id || '',
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const body: Record<string, unknown> = {
      fullName: form.fullName,
      phone: form.phone,
      nationalId: form.nationalId || undefined,
      roleKey: form.roleKey,
      branchId: form.branchId || null,
    }
    if (!edit) {
      body.email = form.email
      body.password = form.password
    } else if (form.password) body.password = form.password
    const res = await fetch(
      edit ? `/api/staff/users/${user!.id}` : '/api/staff/users',
      {
        method: edit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )
    const d = await res.json()
    if (!res.ok) setErr(d.error || 'فشل الحفظ')
    else onSaved()
    setLoading(false)
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] w-full max-w-lg">
        <div className="p-5 border-b flex justify-between">
          <b>{edit ? 'تعديل موظف' : 'إضافة موظف جديد'}</b>
          <button onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {err && <div className="text-red-600">{err}</div>}
          <input
            className="input"
            placeholder="الاسم الكامل"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
          {!edit && (
            <input
              type="email"
              className="input"
              placeholder="البريد الإلكتروني"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          )}
          <input
            className="input"
            placeholder="رقم الهاتف"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <label className="block text-[12px] font-bold">
            الرقم القومي (اختياري)
            <input
              type="text"
              className="input mt-2"
              value={form.nationalId}
              onChange={(e) =>
                setForm({
                  ...form,
                  nationalId: e.target.value.replace(/\D/g, '').slice(0, 14),
                })
              }
              placeholder="14 رقم"
              maxLength={14}
            />
          </label>
          <input
            type="password"
            className="input"
            placeholder="كلمة السر"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!edit}
            minLength={edit ? 0 : 8}
          />
          <select
            className="input"
            value={form.roleKey}
            onChange={(e) => setForm({ ...form, roleKey: e.target.value })}
          >
            {roles.map((r) => (
              <option key={r.key} value={r.key}>
                {r.nameAr}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={form.branchId}
            onChange={(e) => setForm({ ...form, branchId: e.target.value })}
          >
            <option value="">بدون فرع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full border"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-full bg-[#0d7a3e] text-white flex justify-center"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" /> حفظ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
