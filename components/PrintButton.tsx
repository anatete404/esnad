'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#0d7a3e] hover:bg-[#0a5c2f] text-white text-[12px] font-bold transition btn-press"
    >
      <Printer className="w-3.5 h-3.5" />
      طباعة / حفظ PDF
    </button>
  )
}
