'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const FAQS = [
  {
    q: 'من يحق له تقديم طلب تقنين؟',
    a: 'يحق تقديم الطلب لكل من كان واضع يد على قطعة أرض قبل 15 أكتوبر 2023، بشرط أن يكون مصري الجنسية وكامل الأهلية، وأن تكون الأرض داخل نطاق الولاية الإدارية.',
  },
  {
    q: 'ما المستندات المطلوبة لتقديم الطلب؟',
    a: 'بطاقة الرقم القومي سارية، أي وثائق تثبت وضع اليد (توكيل، إيصالات، مستندات شراء عرفي)، صور فوتوغرافية للأرض، وكروكي مساحي إن وُجد.',
  },
  {
    q: 'كم تستغرق مدة معالجة الطلب؟',
    a: 'يتم استلام الطلب ومراجعته خلال 72 ساعة، ثم يُحوَّل للمعاينة الميدانية، وبعدها للتسعير، ثم للجنة المختصة. المدة الإجمالية تختلف حسب طبيعة كل حالة.',
  },
  {
    q: 'كيف أتابع حالة طلبي؟',
    a: 'يمكنك متابعة الطلب في أي وقت من خلال رقم التتبع الخاص بك، عبر صفحة "متابعة طلب" دون الحاجة لتسجيل الدخول، أو من خلال لوحة "ملفاتي" بعد تسجيل الدخول.',
  },
  {
    q: 'ماذا أفعل إذا تم رفض طلبي؟',
    a: 'يمكنك تقديم تظلم على قرار الرفض من خلال المنصة، وسيتم مراجعته من قبل موظف مختص، وفي حال قبول التظلم يُعاد الطلب لمرحلة المراجعة الأولية.',
  },
  {
    q: 'هل يمكنني تعديل البيانات بعد التقديم؟',
    a: 'لا يمكن تعديل البيانات الأساسية بعد إرسال الطلب، لذا تأكد من دقتها قبل الإرسال. يمكنك إضافة مستندات أو تقديم تظلم عند الحاجة.',
  },
]

export default function HomeFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-12 md:px-6 md:py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/5 shadow-sm text-[11px] font-bold">
          <HelpCircle className="w-3.5 h-3.5 text-[#0d7a3e]" />
          <span>الأسئلة الشائعة</span>
        </div>
        <h2 className="mt-4 text-[22px] md:text-[28px] font-extrabold">
          عندك سؤال؟ عندنا إجابة
        </h2>
        <p className="mt-2 text-[13px] text-black/60">
          إجابات على الأسئلة الأكثر شيوعًا من المواطنين
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {FAQS.map((faq, i) => {
          const isOpen = openIdx === i
          return (
            <div
              key={i}
              className={`rounded-[16px] bg-white border transition-all ${
                isOpen
                  ? 'border-[#0d7a3e]/30 shadow-[0_8px_24px_rgba(13,122,62,0.06)]'
                  : 'border-black/5 hover:border-black/10'
              }`}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between gap-3 text-right"
                aria-expanded={isOpen}
              >
                <span className="text-[14px] md:text-[15px] font-bold text-black">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-black/40 shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 text-[#0d7a3e]' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 pb-4 text-[13px] text-black/70 leading-7">
                  {faq.a}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
