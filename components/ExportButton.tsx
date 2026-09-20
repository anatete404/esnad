'use client'

import { useState } from 'react'
import { FileSpreadsheet, FileText, Loader2 } from 'lucide-react'

type Props = {
  href: string
  label?: string
  variant?: 'excel' | 'csv'
}

export default function ExportButton({ href, label = 'تصدير Excel', variant = 'excel' }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const Icon = variant === 'csv' ? FileText : FileSpreadsheet

  const handleClick = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(href)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'فشل التصدير')
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      const cd = res.headers.get('Content-Disposition') || ''
      const match = cd.match(/filename="?([^\"]+)"?/) 
      a.download = match ? match[1] : 'export.xlsx'

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch {
      setError('تعذّر الاتصال بالسيرفر')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`h-10 px-5 rounded-full text-white font-bold text-[12px] flex items-center gap-2 transition disabled:opacity-50 ${variant === 'csv' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#0d7a3e] hover:bg-[#0a5c2f]'}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            جارٍ التصدير...
          </>
        ) : (
          <>
            <Icon className="w-4 h-4" />
            {label}
          </>
        )}
      </button>
      {error && (
        <div className="text-red-600 text-[10px] font-bold">{error}</div>
      )}
    </div>
  )
}
