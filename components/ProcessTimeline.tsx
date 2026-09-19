'use client'

import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  FileSignature,
  FileText,
  Landmark,
  MapPin,
  Scale,
} from 'lucide-react'

const STAGES = [
  {
    n: 1,
    icon: FileText,
    title: 'تقديم الطلب',
    desc: 'تسجيل البيانات ورفع المستندات المطلوبة إلكترونيًا',
    duration: 'يوم واحد',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    n: 2,
    icon: FileSearch,
    title: 'المراجعة الأولية',
    desc: 'مراجعة البيانات والمستندات من قبل الفريق المختص',
    duration: '3 أيام',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    n: 3,
    icon: ClipboardCheck,
    title: 'فحص المستندات',
    desc: 'التحقق من صحة المستندات واكتمالها',
    duration: '5 أيام',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    n: 4,
    icon: MapPin,
    title: 'المعاينة الميدانية',
    desc: 'زيارة الموقع وتحديد المساحة والإحداثيات',
    duration: '7 أيام',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    n: 5,
    icon: Scale,
    title: 'التسعير',
    desc: 'تحديد القيمة المالية وفقًا للقوانين السارية',
    duration: '5 أيام',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    n: 6,
    icon: Landmark,
    title: 'اللجنة المختصة',
    desc: 'عرض الطلب على اللجنة لاتخاذ القرار النهائي',
    duration: '10 أيام',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    n: 7,
    icon: FileSignature,
    title: 'التعاقد',
    desc: 'توقيع العقد واستلام الأرض بشكل قانوني',
    duration: 'يوم واحد',
    color: 'bg-green-50 text-[#0d7a3e]',
  },
]

export default function ProcessTimeline() {
  return (
    <section className="bg-[#0a0f0d] text-white py-12 md:py-16">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#c89a2c]" />
            دورة العمل
          </div>
          <h2 className="mt-4 text-[22px] md:text-[32px] font-extrabold">
            رحلة طلبك من التقديم للتعاقد
          </h2>
          <p className="mt-2 text-[13px] opacity-70 max-w-[60ch] mx-auto leading-7">
            7 مراحل واضحة، كل مرحلة بوقتها المتوقع — لتعرف بالضبط أين وصل طلبك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {STAGES.map((stage) => (
            <div
              key={stage.n}
              className="rounded-[20px] bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition"
            >
              <div className="flex items-center justify-between">
                <div className={`w-11 h-11 rounded-[12px] grid place-items-center ${stage.color}`}>
                  <stage.icon className="w-5 h-5" />
                </div>
                <div className="text-[28px] font-black opacity-20">{stage.n}</div>
              </div>
              <div className="mt-4 font-extrabold text-[14px]">{stage.title}</div>
              <div className="mt-1.5 text-[11px] opacity-65 leading-6">{stage.desc}</div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-[#c89a2c]">
                <ArrowLeft className="w-3 h-3" />
                {stage.duration}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[20px] bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] p-6 text-center">
          <div className="text-[14px] font-bold">
            متوسط مدة الإنجاز الكلية: من 30 إلى 45 يوم عمل
          </div>
          <div className="mt-1 text-[11px] opacity-80">
            المدة تختلف حسب طبيعة كل حالة واكتمال المستندات
          </div>
        </div>
      </div>
    </section>
  )
}
