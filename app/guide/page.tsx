import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  FileSignature,
  FileText,
  HelpCircle,
  MapPin,
  MessageSquareWarning,
  Phone,
  Search,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'
import PrintButton from '@/components/PrintButton'

export const metadata = {
  title: 'دليل المستخدم | منصة إسناد للتنمية الزراعية',
  description: 'دليل شامل لاستخدام منصة إسناد لتقنين أوضاع الأراضي',
}

const SECTIONS = [
  {
    n: 1,
    icon: UserPlus,
    title: 'إنشاء حساب جديد',
    steps: [
      'افتح الموقع من المتصفح، ثم اضغط زر "حساب جديد" من القائمة العلوية.',
      'أدخل بياناتك: الاسم الرباعي، الرقم القومي (14 رقم)، رقم الهاتف، كلمة السر (8 أحرف على الأقل).',
      'اختر المحافظة، ثم اضغط "إنشاء الحساب".',
      'سيتم تحويلك مباشرة إلى لوحة "ملفاتي" ويمكنك البدء في تقديم الطلب.',
    ],
  },
  {
    n: 2,
    icon: FileText,
    title: 'تقديم طلب تقنين',
    steps: [
      'من لوحة "ملفاتي"، اضغط زر "تقديم طلب جديد".',
      'الخطوة 1 — بيانات الأرض: المحافظة، المركز، القرية، ووصف تفصيلي للموقع.',
      'الخطوة 1 (تكملة) — المساحة: أدخل فدان + قيراط + سهم. الحاسبة تعرض الإجمالي تلقائياً.',
      'الخطوة 2 — تفاصيل إضافية: تاريخ وضع اليد، السبب، النشاط، مصدر المياه، حالة الأرض.',
      'الخطوة 3 — رفع المستندات: بطاقة الرقم القومي، التوكيل، إثبات وضع اليد، صور الأرض، إيصالات.',
      'الخطوة 4 — المراجعة والإرسال: راجع كل البيانات ثم اضغط "إنهاء والإرسال".',
      'ستحصل على رقم تتبع فريد بصيغة EGY-TQN-XXXXXX.',
    ],
  },
  {
    n: 3,
    icon: Calculator,
    title: 'حاسبة المساحة',
    steps: [
      'الفدان = 24 قيراط = 576 سهم.',
      'القيراط = 24 سهم.',
      'عند إدخال المساحة في الاستمارة، الحاسبة تعرض لك الإجمالي فوراً بالفدان.',
      'المساحة الرسمية تُحدد بعد المعاينة الميدانية من قبل الفريق المختص.',
    ],
  },
  {
    n: 4,
    icon: Search,
    title: 'متابعة حالة الطلب',
    steps: [
      'من صفحة "متابعة طلب" — أدخل رقم التتبع (بدون تسجيل دخول).',
      'أو من لوحة "ملفاتي" بعد تسجيل الدخول بالرقم القومي.',
      'كل طلب له رمز QR خاص — امسحه بكاميرا الهاتف للوصول السريع.',
      'ستجد: المرحلة الحالية، سجل المراحل، بيانات الأرض، الرسوم، والمستندات.',
    ],
  },
  {
    n: 5,
    icon: MessageSquareWarning,
    title: 'تقديم تظلم',
    steps: [
      'التظلم متاح فقط للطلبات المرفوضة.',
      'افتح تفاصيل الطلب من "ملفاتي" أو من بوابة الموظفين.',
      'اضغط زر "تقديم تظلم"، اكتب السبب (10 أحرف على الأقل) وتفاصيل إضافية.',
      'سيتم مراجعة التظلم من موظف مختص.',
      'في حال القبول — يُعاد الطلب لمرحلة المراجعة الأولية. في حال الرفض — يبقى الطلب مرفوضاً.',
    ],
  },
  {
    n: 6,
    icon: FileSignature,
    title: 'التعاقد',
    steps: [
      'بعد اعتماد الطلب، يقوم الموظف المختص بإنشاء العقد.',
      'يمكنك تحميل نسخة PDF من العقد من تفاصيل الطلب.',
      'بعد توقيع العقد، تتحول حالة الطلب تلقائياً إلى "منجز".',
      'تصلك إشعارات بالإيميل عند كل تغيير في حالة الطلب.',
    ],
  },
  {
    n: 7,
    icon: MapPin,
    title: 'المعاينة الميدانية',
    steps: [
      'بعد فحص المستندات، يتم جدولة معاينة ميدانية للأرض.',
      'المعاينة تشمل: التحقق من المساحة، الحدود، الإحداثيات، والنشاط الحالي.',
      'يمكنك رؤية موقع الأرض على الخريطة من تفاصيل الطلب (زر "عرض على الخريطة").',
      'نتائج المعاينة تُضاف إلى ملف الطلب.',
    ],
  },
]

const FAQS = [
  { q: 'هل التسجيل مجاني؟', a: 'نعم، التسجيل على المنصة مجاني تماماً. لا توجد أي رسوم للتسجيل أو التصفح.' },
  { q: 'هل يمكنني تعديل الطلب بعد الإرسال؟', a: 'لا يمكن تعديل البيانات الأساسية بعد الإرسال. تأكد من دقتها قبل التقديم.' },
  { q: 'كم تستغرق مدة معالجة الطلب؟', a: 'المدة تختلف حسب طبيعة كل حالة، لكن المتوسط بين 30 و 45 يوم عمل.' },
  { q: 'ماذا أفعل إذا فقدت رقم التتبع؟', a: 'يمكنك الدخول إلى حسابك في "ملفاتي" والعثور على رقم التتبع من قائمة الطلبات.' },
  { q: 'من يحق له تقديم طلب تقنين؟', a: 'كل من كان واضع يد على الأرض قبل 15 أكتوبر 2023، بشرط أن يكون مصري الجنسية وكامل الأهلية.' },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#f8faf7]" dir="rtl">
      <div className="print:hidden sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl flex h-[60px] items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#0d7a3e] text-[16px] font-black text-white">
              ح
            </div>
            <div className="leading-tight">
              <div className="text-[13px] font-extrabold">منصة إسناد للتنمية الزراعية</div>
              <div className="text-[10px] text-black/55">دليل المستخدم</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <PrintButton />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-black/10 text-[12px] font-bold hover:border-[#0d7a3e] transition"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              الرئيسية
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 md:px-6 py-8 md:py-12">
        <header className="text-center pb-8 mb-8 border-b-2 border-[#0d7a3e]/20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f0faf4] border border-[#0d7a3e]/20 text-[11px] font-bold text-[#0d5a2e]">
            <BookOpen className="w-3.5 h-3.5" />
            دليل شامل
          </div>
          <h1 className="mt-4 text-[28px] md:text-[36px] font-extrabold tracking-tight">
            دليل المستخدم
          </h1>
          <p className="mt-3 text-[14px] text-black/65 leading-8 max-w-[62ch] mx-auto">
            كل ما تحتاج معرفته لاستخدام منصة إسناد لتقنين أوضاع الأراضي — من التسجيل حتى التعاقد.
          </p>
        </header>

        <div className="space-y-6">
          {SECTIONS.map((section) => (
            <section
              key={section.n}
              className="rounded-[20px] bg-white border border-black/5 p-6 md:p-7 print:border-black/20 print:rounded-none print:break-inside-avoid"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-[14px] bg-[#0d7a3e]/10 grid place-items-center shrink-0">
                  <section.icon className="w-6 h-6 text-[#0d7a3e]" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#0d7a3e]">
                    الخطوة {section.n}
                  </div>
                  <h2 className="text-[18px] md:text-[20px] font-extrabold mt-0.5">
                    {section.title}
                  </h2>
                </div>
              </div>

              <ol className="space-y-2.5 list-decimal list-inside marker:font-bold marker:text-[#0d7a3e]">
                {section.steps.map((step, i) => (
                  <li key={i} className="text-[13px] md:text-[14px] leading-7 text-black/75 pl-1">
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-[20px] bg-[#fbfaf2] border border-[#c89a2c]/20 p-6 md:p-7 print:break-inside-avoid">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-[14px] bg-[#c89a2c]/15 grid place-items-center shrink-0">
              <HelpCircle className="w-6 h-6 text-[#c89a2c]" />
            </div>
            <h2 className="text-[18px] md:text-[20px] font-extrabold">
              أسئلة شائعة
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-black/5 pb-4 last:border-0 last:pb-0">
                <div className="text-[13px] md:text-[14px] font-bold flex items-start gap-2">
                  <span className="text-[#0d7a3e] shrink-0">❓</span>
                  {faq.q}
                </div>
                <div className="text-[12px] md:text-[13px] text-black/65 leading-7 mt-1.5 pr-6">
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[20px] bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] text-white p-6 md:p-7 print:bg-[#0d7a3e] print:break-inside-avoid">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-[14px] bg-white/15 grid place-items-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <h2 className="text-[18px] md:text-[20px] font-extrabold">
              تحتاج مساعدة؟
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-3 text-[13px]">
            <div className="flex items-center gap-2">
              <span className="opacity-75">واتساب:</span>
              <a href="https://wa.me/201113999179" className="font-bold underline" dir="ltr">
                01113999179
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="opacity-75">البريد:</span>
              <a href="mailto:Elhassan22003@gmail.com" className="font-bold text-[11px]">
                Elhassan22003@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="opacity-75">سجل تجاري:</span>
              <span className="font-bold">157574</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="opacity-75">سنوات الخبرة:</span>
              <span className="font-bold">+22 سنة</span>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-white/15 p-3 text-[11px] leading-6">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>تنبيه مهم:</strong> القرار النهائي على الطلب يصدر من الجهة المختصة فقط. المنصة وسيلة للتقديم والمتابعة ولا تُعد وعداً بالموافقة.
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 pt-6 border-t border-black/5 text-center text-[11px] text-black/40">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0d7a3e]" />
            <span>منصة إسناد للتنمية الزراعية — سجل تجاري 157574</span>
          </div>
          <div className="mt-1">
            تم تحديث هذا الدليل في {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
          </div>
        </footer>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background: white !important;
          }
          .print\:hidden {
            display: none !important;
          }
          .print\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          a[href]:after {
            content: "";
          }
        }
      `}</style>
    </div>
  )
}
