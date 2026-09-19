'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertOctagon, ArrowRight, RefreshCw } from 'lucide-react'

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Portal Error]', error)
  }, [error])

  return (
    <div className="rounded-[24px] bg-white border border-red-200 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 grid place-items-center shrink-0">
          <AlertOctagon className="w-7 h-7 text-red-500" />
        </div>
        <div className="flex-1">
          <h1 className="text-[20px] font-extrabold text-black">
            حدث خطأ في بوابة الموظفين
          </h1>
          <p className="mt-2 text-[13px] text-black/60 leading-7">
            نعتذر عن الإزعاج. يمكنك إعادة المحاولة أو العودة إلى لوحة التحكم.
          </p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3">
              <div className="text-[10px] font-bold text-red-600 mb-1">تفاصيل الخطأ:</div>
              <pre className="text-[10px] text-red-800 font-mono whitespace-pre-wrap break-words leading-5" dir="ltr">
                {error.message}
              </pre>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={reset}
              className="h-11 px-6 rounded-full bg-[#0d7a3e] hover:bg-[#0a5c2f] text-white font-bold text-[13px] flex items-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة المحاولة
            </button>
            <Link
              href="/portal"
              className="h-11 px-6 rounded-full border border-black/10 hover:border-[#0d7a3e] font-bold text-[13px] flex items-center gap-2 transition"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              لوحة التحكم
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
