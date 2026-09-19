'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import {
  FileText,
  Home,
  Loader2,
  MessageSquareWarning,
  Search,
  TrendingUp,
  User,
  UserCircle,
  Users,
} from 'lucide-react'

type Result = {
  id: string
  title: string
  subtitle: string
  href: string
  icon: typeof FileText
  category: 'page' | 'application' | 'appeal' | 'user'
}

const PAGES: Result[] = [
  { id: 'p1', title: 'لوحة التحكم', subtitle: 'الصفحة الرئيسية للبوابة', href: '/portal', icon: Home, category: 'page' },
  { id: 'p2', title: 'الطلبات', subtitle: 'إدارة ومتابعة الطلبات', href: '/portal/applications', icon: FileText, category: 'page' },
  { id: 'p3', title: 'التظلمات', subtitle: 'مراجعة التظلمات', href: '/portal/appeals', icon: MessageSquareWarning, category: 'page' },
  { id: 'p4', title: 'المستخدمون', subtitle: 'إدارة الموظفين', href: '/portal/users', icon: Users, category: 'page' },
  { id: 'p5', title: 'التقارير', subtitle: 'مؤشرات الأداء', href: '/portal/reports', icon: TrendingUp, category: 'page' },
  { id: 'p6', title: 'سجل التدقيق', subtitle: 'متابعة الإجراءات', href: '/portal/audit', icon: Search, category: 'page' },
]

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Result[]>([])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    if (!open) return

    const trimmed = q.trim()
    if (trimmed.length < 2) {
      setResults(PAGES)
      return
    }

    setLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/staff/search?q=${encodeURIComponent(trimmed)}`)
        if (!res.ok) return
        const data = await res.json()

        const appResults: Result[] = (data.applications || []).map((a: {
          id: string
          trackingNumber: string
          status: string
          citizen: { fullName: string; nationalId: string }
        }) => ({
          id: `app-${a.id}`,
          title: a.trackingNumber,
          subtitle: `${a.citizen.fullName} — ${a.status}`,
          href: `/portal/applications/${a.id}`,
          icon: FileText,
          category: 'application' as const,
        }))

        const appealResults: Result[] = (data.appeals || []).map((a: {
          id: string
          reason: string
          status: string
          application: { trackingNumber: string }
          citizen: { fullName: string }
        }) => ({
          id: `appeal-${a.id}`,
          title: `تظلم ${a.application.trackingNumber}`,
          subtitle: `${a.citizen.fullName} — ${a.status}`,
          href: `/portal/appeals/${a.id}`,
          icon: MessageSquareWarning,
          category: 'appeal' as const,
        }))

        const userResults: Result[] = (data.users || []).map((u: {
          id: string
          fullName: string
          email: string
          role: { nameAr: string }
        }) => ({
          id: `user-${u.id}`,
          title: u.fullName,
          subtitle: `${u.email} — ${u.role.nameAr}`,
          href: `/portal/users`,
          icon: UserCircle,
          category: 'user' as const,
        }))

        const matchedPages = PAGES.filter((p) =>
          p.title.includes(trimmed) || p.subtitle.includes(trimmed)
        )

        setResults([...matchedPages, ...appResults, ...appealResults, ...userResults])
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => {
      clearTimeout(timeout)
      setLoading(false)
    }
  }, [q, open])

  const handleSelect = (result: Result) => {
    router.push(result.href)
    setOpen(false)
    setQ('')
  }

  const pages = results.filter((r) => r.category === 'page')
  const applications = results.filter((r) => r.category === 'application')
  const appeals = results.filter((r) => r.category === 'appeal')
  const users = results.filter((r) => r.category === 'user')

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="بحث سريع"
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
      shouldFilter={false}
    >
      <div className="w-full max-w-xl rounded-[20px] bg-white shadow-2xl border border-black/5 overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-black/5">
          <Search className="w-4 h-4 text-black/40 shrink-0" />
          <Command.Input
            value={q}
            onValueChange={setQ}
            placeholder="ابحث في الطلبات، التظلمات، المستخدمين..."
            className="flex-1 h-[52px] bg-transparent outline-none text-[14px] font-medium placeholder:text-black/40"
            autoFocus
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-[#0d7a3e]" />}
          <kbd className="hidden md:inline-flex h-6 px-2 items-center gap-1 rounded bg-black/5 text-[10px] font-mono text-black/50">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="text-center py-10">
            <User className="w-8 h-8 mx-auto text-black/20 mb-2" />
            <div className="text-[13px] text-black/55 font-medium">
              {loading ? 'جارٍ البحث...' : 'لا توجد نتائج'}
            </div>
            <div className="text-[11px] text-black/40 mt-1">
              جرب البحث برقم التتبع، الاسم، أو الرقم القومي
            </div>
          </Command.Empty>

          {pages.length > 0 && (
            <Command.Group
              heading={<span className="text-[11px] font-bold text-black/50 px-2">الصفحات</span>}
            >
              {pages.map((r) => (
                <ResultItem key={r.id} result={r} onSelect={() => handleSelect(r)} />
              ))}
            </Command.Group>
          )}

          {applications.length > 0 && (
            <Command.Group
              heading={<span className="text-[11px] font-bold text-black/50 px-2 mt-3">الطلبات</span>}
            >
              {applications.map((r) => (
                <ResultItem key={r.id} result={r} onSelect={() => handleSelect(r)} />
              ))}
            </Command.Group>
          )}

          {appeals.length > 0 && (
            <Command.Group
              heading={<span className="text-[11px] font-bold text-black/50 px-2 mt-3">التظلمات</span>}
            >
              {appeals.map((r) => (
                <ResultItem key={r.id} result={r} onSelect={() => handleSelect(r)} />
              ))}
            </Command.Group>
          )}

          {users.length > 0 && (
            <Command.Group
              heading={<span className="text-[11px] font-bold text-black/50 px-2 mt-3">المستخدمون</span>}
            >
              {users.map((r) => (
                <ResultItem key={r.id} result={r} onSelect={() => handleSelect(r)} />
              ))}
            </Command.Group>
          )}
        </Command.List>

        <div className="border-t border-black/5 px-4 py-2.5 flex items-center justify-between text-[10px] text-black/50 bg-[#f9fbf9]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-black/10 font-mono">↑↓</kbd>
              تنقل
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-black/10 font-mono">Enter</kbd>
              فتح
            </span>
          </div>
          <span>منصة إسناد للتنمية الزراعية</span>
        </div>
      </div>
    </Command.Dialog>
  )
}

function ResultItem({ result, onSelect }: { result: Result; onSelect: () => void }) {
  const Icon = result.icon
  return (
    <Command.Item
      value={result.id}
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer data-[selected=true]:bg-[#f0faf4] data-[selected=true]:border data-[selected=true]:border-[#0d7a3e]/20 border border-transparent transition"
    >
      <div className="w-9 h-9 rounded-[10px] bg-[#0d7a3e]/10 grid place-items-center shrink-0">
        <Icon className="w-4 h-4 text-[#0d7a3e]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-black truncate">{result.title}</div>
        <div className="text-[11px] text-black/55 truncate mt-0.5">{result.subtitle}</div>
      </div>
    </Command.Item>
  )
}
