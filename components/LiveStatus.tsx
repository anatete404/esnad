'use client'

import { useEffect, useState } from 'react'

type Status = 'checking' | 'online' | 'offline'

export default function LiveStatus() {
  const [status, setStatus] = useState<Status>('checking')
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const check = async () => {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' })
      setStatus(res.ok ? 'online' : 'offline')
    } catch {
      setStatus('offline')
    } finally {
      setLastCheck(new Date())
    }
  }

  useEffect(() => {
    void check()
    const interval = setInterval(() => void check(), 60000)
    return () => clearInterval(interval)
  }, [])

  const config = {
    checking: {
      dot: 'bg-amber-400',
      pulse: 'bg-amber-400',
      label: 'جارٍ التحقق...',
      text: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
    },
    online: {
      dot: 'bg-[#0d7a3e]',
      pulse: 'bg-[#0d7a3e]',
      label: 'المنصة تعمل الآن',
      text: 'text-[#0d5a2e]',
      bg: 'bg-[#f0faf4] border-[#0d7a3e]/20',
    },
    offline: {
      dot: 'bg-red-500',
      pulse: 'bg-red-500',
      label: 'المنصة غير متاحة',
      text: 'text-red-700',
      bg: 'bg-red-50 border-red-200',
    },
  }[status]

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold ${config.bg} ${config.text}`}
      title={lastCheck ? `آخر فحص: ${lastCheck.toLocaleTimeString('ar-EG')}` : ''}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${config.pulse}`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      {config.label}
    </div>
  )
}
