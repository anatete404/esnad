import { Mail, MapPin, Phone } from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="mt-16 bg-[#0a0f0d] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-[12px] leading-7 md:grid-cols-3 md:px-6">
        <div>
          <div className="text-[15px] font-extrabold">منصة إسناد للتنمية الزراعية</div>
          <div className="mt-3 opacity-70">
            لاستصلاح الأراضي الصحراوية • سجل تجاري 157574 منذ 2004
            <br />
            منظومة متكاملة لتقنين أوضاع الأراضي
          </div>
        </div>

        <div>
          <div className="text-[13px] font-bold">روابط سريعة</div>
          <div className="mt-3 grid grid-cols-2 gap-2 opacity-70">
            <a href="/track" className="hover:text-white">متابعة طلب</a>
            <a href="/register" className="hover:text-white">حساب جديد</a>
            <a href="/portal/login" className="hover:text-white">دخول الموظفين</a>
            <a href="/stats" className="hover:text-white">إحصائيات المنصة</a>
          </div>
        </div>

        <div>
          <div className="text-[13px] font-bold">تواصل</div>
          <div className="mt-3 space-y-1.5 opacity-70">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" /> 01113999179
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> Elhassan22003@gmail.com
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> جمهورية مصر العربية
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-[11px] opacity-60">
        © 2024 - 2026 منصة إسناد للتنمية الزراعية. جميع الحقوق محفوظة.
      </div>
    </footer>
  )
}
