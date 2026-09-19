'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Clock, Eye, FileWarning, Filter, Loader2, MessageSquareWarning, Search } from 'lucide-react'

const STATUSES = [{ value: '', label: 'كل الحالات' }, { value: 'PENDING', label: 'قيد المراجعة' }, { value: 'APPROVED', label: 'مقبول' }, { value: 'REJECTED', label: 'مرفوض' }]
const STATUS_LABELS: Record<string, string> = { PENDING: 'قيد المراجعة', APPROVED: 'مقبول', REJECTED: 'مرفوض' }
const STATUS_COLORS: Record<string, string> = { PENDING: 'bg-amber-50 text-amber-800 border-amber-200', APPROVED: 'bg-green-50 text-green-700 border-green-200', REJECTED: 'bg-red-50 text-red-700 border-red-200' }
type Row = { id: string; reason: string; status: string; createdAt: string; citizen: { fullName: string; nationalId: string; phone: string }; application: { id: string; trackingNumber: string; status: string; stage: string; land: { gov: string | null; totalFaddan: number } | null }; reviewedBy: { fullName: string } | null }

export default function AppealsListPage() {
  const [items, setItems] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const load = async () => { setLoading(true); const params = new URLSearchParams({ page: '1', pageSize: '50' }); if (q) params.set('q', q); if (status) params.set('status', status); try { const [listRes, statsRes] = await Promise.all([fetch(`/api/staff/appeals?${params}`), fetch('/api/staff/appeals/stats')]); if (listRes.ok) { const data = await listRes.json(); setItems(data.items); setTotal(data.total) }; if (statsRes.ok) setStats(await statsRes.json()) } finally { setLoading(false) } }
  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [status])
  return <div className="space-y-6">
    <div><h1 className="text-[22px] font-extrabold flex items-center gap-2"><MessageSquareWarning className="w-5 h-5 text-[#c89a2c]" />التظلمات</h1><p className="text-[12px] text-black/55 mt-1">مراجعة وإدارة تظلمات المواطنين على الطلبات المرفوضة ({total} تظلم)</p></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">{[['الإجمالي', stats.total, 'text-black'], ['قيد المراجعة', stats.pending, 'text-amber-700'], ['مقبول', stats.approved, 'text-green-700'], ['مرفوض', stats.rejected, 'text-red-700']].map(([label, value, color]) => <div key={String(label)} className="rounded-[16px] bg-white border border-black/5 p-4"><div className="text-[11px] text-black/55 font-bold">{label}</div><div className={`mt-1 text-[22px] font-extrabold ${color}`}>{value}</div></div>)}</div>
    <form onSubmit={(e) => { e.preventDefault(); void load() }} className="rounded-[18px] bg-white border border-black/5 p-4 grid md:grid-cols-[1fr_auto_auto] gap-3"><div className="relative"><Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-black/30" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث برقم الطلب / الاسم / الرقم القومي" className="input pr-10" /></div><select value={status} onChange={(e) => setStatus(e.target.value)} className="input md:w-44">{STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select><button className="h-11 px-6 rounded-full bg-[#0d7a3e] text-white font-bold text-[13px] flex items-center gap-2"><Filter className="w-4 h-4" />تطبيق</button></form>
    <div className="rounded-[18px] bg-white border border-black/5 overflow-hidden">{loading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#0d7a3e]" /></div> : items.length === 0 ? <div className="text-center py-16"><FileWarning className="w-10 h-10 mx-auto text-black/20" /><div className="mt-3 text-[14px] font-bold">لا توجد تظلمات</div></div> : <div className="overflow-x-auto"><table className="w-full text-[12px]"><thead className="bg-[#f9fbf9]"><tr>{['رقم الطلب', 'المواطن', 'السبب', 'الحالة', 'تاريخ التقديم', 'المُراجع', ''].map((h) => <th key={h} className="text-right px-4 py-3 font-bold text-black/60">{h}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b border-black/5 hover:bg-[#f9fbf9]"><td className="px-4 py-3 font-mono font-bold text-[#0d7a3e]">{item.application.trackingNumber}</td><td className="px-4 py-3"><div className="font-bold">{item.citizen.fullName}</div><div className="text-[10px] text-black/45">{item.citizen.nationalId}</div></td><td className="px-4 py-3 max-w-[280px]"><div className="truncate">{item.reason}</div></td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full border text-[10px] font-bold ${STATUS_COLORS[item.status] || ''}`}>{STATUS_LABELS[item.status] || item.status}</span></td><td className="px-4 py-3 text-black/60">{new Date(item.createdAt).toLocaleDateString('ar-EG')}</td><td className="px-4 py-3 text-black/60">{item.reviewedBy?.fullName || '—'}</td><td className="px-4 py-3"><Link href={`/portal/appeals/${item.id}`} className="w-8 h-8 rounded-full bg-[#c89a2c]/10 grid place-items-center text-[#c89a2c] hover:bg-[#c89a2c] hover:text-white transition"><Eye className="w-4 h-4" /></Link></td></tr>)}</tbody></table></div>}</div>
  </div>
}
