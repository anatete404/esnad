import { ArrowUpRight, CalendarDays, Sparkles } from 'lucide-react'
import ChangelogTimeline, { type ChangelogEntry } from '@/components/ChangelogTimeline'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'

export const metadata = {
  title: 'آخر التحديثات',
  description: 'أحدث الميزات والتحديثات في منصة إسناد',
}

const ENTRIES: ChangelogEntry[] = [
  {
    date: '2026-09-20',
    version: 'Batch 5D',
    title: 'دخول المواطن بالإيميل أو الرقم القومي',
    description: 'أصبح تسجيل الدخول أكثر مرونة مع دعم البريد الإلكتروني بجانب الرقم القومي.',
    type: 'feature',
  },
  {
    date: '2026-09-20',
    version: 'Batch 5D',
    title: 'Timeline من 9 مراحل مع معالجة الرفض',
    description: 'تتبّع أوضح لمسار الطلب من التقديم وحتى التعاقد، مع مسار مخصص للطلبات المرفوضة.',
    type: 'feature',
  },
  {
    date: '2026-09-20',
    version: 'Batch 5C',
    title: 'مركز المساعدة',
    description: 'إجابات عملية عن التسجيل والطلبات والمستندات والمدفوعات والتظلمات في 21 سؤالًا.',
    type: 'feature',
  },
  {
    date: '2026-09-20',
    version: 'Batch 5C',
    title: 'أزرار CSV للتقارير',
    description: 'تحميل الطلبات والمدفوعات والتظلمات بصيغة CSV من لوحة التقارير.',
    type: 'feature',
  },
  {
    date: '2026-09-19',
    version: 'Batch 5B',
    title: 'تصدير CSV للطلبات والمدفوعات والتظلمات',
    description: 'إتاحة ملفات CSV منظمة للاستخدام في التحليل والأرشفة اليومية.',
    type: 'feature',
  },
  {
    date: '2026-09-19',
    version: 'Batch 5B',
    title: 'تحسين ظهور المنصة في البحث',
    description: 'إضافة sitemap وrobots.txt لمساعدة محركات البحث على فهم الصفحات العامة.',
    type: 'improvement',
  },
  {
    date: '2026-09-19',
    version: 'Batch 5A',
    title: 'صفحات قانونية جديدة',
    description: 'صفحتا سياسة الخصوصية وشروط الاستخدام أصبحتا متاحتين بوضوح من المنصة.',
    type: 'feature',
  },
  {
    date: '2026-09-19',
    title: 'تحسين نصوص الهيدر',
    description: 'تحديث العناوين والروابط الرئيسية لتكون أسهل في الفهم والوصول.',
    type: 'improvement',
  },
  {
    date: '2026-09-19',
    version: 'Batch 4C',
    title: 'الرسائل الداخلية مع @mentions',
    description: 'تواصل أسرع بين أعضاء الفريق مع إمكانية الإشارة إلى زميل داخل الرسالة.',
    type: 'feature',
  },
  {
    date: '2026-09-19',
    version: 'Batch 4B',
    title: 'نظام الحضور والانصراف',
    description: 'تسجيل أوقات الحضور والانصراف ومتابعة نشاط فريق العمل من البوابة.',
    type: 'feature',
  },
  {
    date: '2026-09-19',
    version: 'Batch 4A',
    title: 'Approval Chain بثلاثة مستويات',
    description: 'تدفق موافقات واضح يوزع مراجعة الطلبات على ثلاث مراحل اعتماد.',
    type: 'feature',
  },
  {
    date: '2026-09-18',
    title: 'تسليم المهام بين الموظفين',
    description: 'تحويل مسؤولية الطلب بين أعضاء الفريق مع الحفاظ على سجل الإجراءات.',
    type: 'feature',
  },
  {
    date: '2026-09-18',
    title: 'تحسين إحصائيات الصفحة الرئيسية',
    description: 'عرض المؤشرات الأساسية للمنصة بصورة أوضح وأسهل في القراءة.',
    type: 'improvement',
  },
  {
    date: '2026-09-18',
    title: 'حاسبة المساحة',
    description: 'أداة مساعدة لحساب المساحة وتحويل الوحدات أثناء تجهيز بيانات الأرض.',
    type: 'feature',
  },
  {
    date: '2026-09-17',
    title: 'QR Code وPDF للطلب',
    description: 'إنشاء رمز QR ونسخة PDF من بيانات الطلب لتسهيل المشاركة والأرشفة.',
    type: 'feature',
  },
]

export default function WhatsNewPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f8faf7]">
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
        <header className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1.5 text-[11px] font-bold shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#0d7a3e]" />
            سجل المنصة
          </div>
          <h1 className="mt-4 text-[28px] font-extrabold tracking-tight md:text-[38px]">آخر التحديثات</h1>
          <p className="mx-auto mt-3 max-w-[62ch] text-[14px] leading-8 text-black/60">
            كل ما هو جديد في منصة إسناد، من الميزات الجديدة إلى التحسينات التي تجعل رحلتك أسهل.
          </p>
        </header>

        <section className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="ملخص التحديثات">
          <div className="rounded-[18px] border border-black/5 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[11px] font-bold text-black/50">
              <CalendarDays className="h-4 w-4 text-[#0d7a3e]" />
              إجمالي التحديثات
            </div>
            <div className="mt-2 text-[25px] font-extrabold text-[#0d7a3e]">{ENTRIES.length}</div>
          </div>
          <div className="rounded-[18px] border border-black/5 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[11px] font-bold text-black/50">
              <ArrowUpRight className="h-4 w-4 text-[#c89a2c]" />
              أحدث إصدار
            </div>
            <div className="mt-2 text-[18px] font-extrabold">Batch 5D</div>
            <div className="mt-0.5 text-[11px] text-black/50">20 سبتمبر 2026</div>
          </div>
        </section>

        <section className="mt-8" aria-label="التحديثات بالتسلسل الزمني">
          <ChangelogTimeline entries={ENTRIES} />
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
