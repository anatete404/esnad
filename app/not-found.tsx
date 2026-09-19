import Link from 'next/link'
import { FileQuestion, Home, Search } from 'lucide-react'
import PublicHeader from '@/components/PublicHeader'
import PublicFooter from '@/components/PublicFooter'

export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <div className="min-h-[70vh] flex items-center justify-center p-4 bg-[#f8faf7]">
        <div className="max-w-md w-full rounded-[24px] bg-white border border-black/5 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-center">
          <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200 grid place-items-center mx-auto">
            <FileQuestion className="w-10 h-10 text-amber-500" />
          </div>

          <h1 className="mt-5 text-[22px] font-extrabold text-black">
            الصفحة غير موجودة
          </h1>
          <p className="mt-2 text-[13px] text-black/60 leading-7">
            الرابط الذي تحاول الوصول إليه غير متوفر أو تم نقله.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <Link
              href="/"
              className="h-11 px-6 rounded-full bg-[#0d7a3e] hover:bg-[#0a5c2f] text-white font-bold text-[13px] flex items-center gap-2 transition"
            >
              <Home className="w-4 h-4" />
              الرئيسية
            </Link>
            <Link
              href="/track"
              className="h-11 px-6 rounded-full border border-black/10 hover:border-[#0d7a3e] font-bold text-[13px] flex items-center gap-2 transition"
            >
              <Search className="w-4 h-4" />
              متابعة طلب
            </Link>
          </div>

          <div className="mt-6 text-[11px] text-black/40">
            منصة إسناد للتنمية الزراعية
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  )
}
