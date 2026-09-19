'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Global Error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8faf7]">
      <div className="max-w-md w-full rounded-[24px] bg-white border border-black/5 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-center">
        <div className="w-20 h-20 rounded-full bg-red-50 border border-red-200 grid place-items-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="mt-5 text-[22px] font-extrabold text-black">
          حدث خطأ غير متوقع
        </h1>
        <p className="mt-2 text-[13px] text-black/60 leading-7">
          نعتذر عن الإزعاج. يمكنك إعادة المحاولة أو العودة للصفحة الرئيسية.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-right">
            <div className="text-[10px] font-bold text-red-600 mb-1">تفاصيل الخطأ (تطوير فقط):</div>
            <pre className="text-[10px] text-red-800 font-mono whitespace-pre-wrap break-words leading-5" dir="ltr">
              {error.message}
            </pre>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <button
            onClick={reset}
            className="h-11 px-6 rounded-full bg-[#0d7a3e] hover:bg-[#0a5c2f] text-white font-bold text-[13px] flex items-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
          <Link
            href="/"
            className="h-11 px-6 rounded-full border border-black/10 hover:border-[#0d7a3e] font-bold text-[13px] flex items-center gap-2 transition"
          >
            <Home className="w-4 h-4" />
            الرئيسية
          </Link>
        </div>

        <div className="mt-6 text-[11px] text-black/40">
          منصة إسناد للتنمية الزراعية
        </div>
      </div>
    </div>
  )
}
