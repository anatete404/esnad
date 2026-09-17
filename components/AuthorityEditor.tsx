'use client'

import { useState } from 'react'
import { Building2, Check, Edit2, Loader2, X } from 'lucide-react'

type Props = {
  applicationId: string
  initialAuthority: string | null
  canEdit: boolean
}

export default function AuthorityEditor({
  applicationId,
  initialAuthority,
  canEdit,
}: Props) {
  const [authority, setAuthority] = useState(initialAuthority || '')
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(initialAuthority || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(
        `/api/staff/applications/${applicationId}/authority`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authorityName: value.trim() || null }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'فشل الحفظ')
        return
      }
      setAuthority(value.trim())
      setEditing(false)
    } catch {
      setError('تعذّر الاتصال')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-5 py-3 flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
      <div className="flex items-center gap-2 text-black/45 shrink-0">
        <Building2 className="w-3.5 h-3.5" />
        <span className="text-[11px] font-bold text-black/55">جهة الولاية</span>
      </div>

      {editing ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 h-9 px-3 rounded-lg border border-black/10 text-[12px] font-bold focus:border-[#0d7a3e] focus:outline-none"
            placeholder="مثال: هيئة الأوقاف المصرية"
            autoFocus
          />
          <button
            onClick={save}
            disabled={saving}
            className="w-8 h-8 rounded-full bg-green-50 hover:bg-green-100 text-green-700 grid place-items-center disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => {
              setEditing(false)
              setValue(authority)
              setError('')
            }}
            disabled={saving}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 grid place-items-center disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-between gap-2">
          <span className="text-[13px] font-bold text-black/85 truncate">
            {authority || <span className="text-black/30">غير محدد</span>}
          </span>
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 grid place-items-center shrink-0"
              title="تعديل جهة الولاية"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="text-red-600 text-[10px] font-bold md:mt-0 mt-1">{error}</div>
      )}
    </div>
  )
}
