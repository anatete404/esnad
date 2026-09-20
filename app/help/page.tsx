import Link from 'next/link'
import { ArrowLeft, BookOpen, MessageCircle, Phone } from 'lucide-react'
import HelpAccordion, { type HelpItem } from '@/components/HelpAccordion'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'

export const metadata = {
  title: 'مركز المساعدة',
  description: 'أسئلة شائعة وإجابات حول منصة إسناد للتنمية الزراعية',
}

const HELP_ITEMS: HelpItem[] = [
  {
    id: 'create-account',
    category: 'التسجيل والحساب',
    question: 'إزاي أعمل حساب على المنصة؟',
    answer: 'افتح صفحة إنشاء حساب، ثم أدخل الاسم الرباعي والرقم القومي ورقم الهاتف وكلمة السر والمحافظة. بعد إنشاء الحساب يمكنك الانتقال مباشرة إلى لوحة ملفاتي وتقديم طلب جديد.',
  },
  {
    id: 'forgot-password',
    category: 'التسجيل والحساب',
    question: 'نسيت كلمة السر، أعمل إيه؟',
    answer: 'حاليًا لا توجد خدمة استعادة كلمة سر آلية داخل المنصة. تواصل مع فريق الدعم من صفحة تواصل معنا، واذكر بياناتك الأساسية ليتم مساعدتك بعد التحقق من هويتك.',
  },
  {
    id: 'email-login',
    category: 'التسجيل والحساب',
    question: 'أقدر أدخل بالإيميل بدل الرقم القومي؟',
    answer: 'نعم، يمكنك تسجيل الدخول باستخدام الرقم القومي أو البريد الإلكتروني المسجل على الحساب. إذا كان نفس البريد مرتبطًا بأكثر من حساب وكانت كلمة السر متطابقة، سيُطلب الرقم القومي لتحديد الحساب الصحيح.',
  },
  {
    id: 'registration-documents',
    category: 'التسجيل والحساب',
    question: 'إيه المستندات المطلوبة للتسجيل؟',
    answer: 'التسجيل نفسه يحتاج بيانات الهوية والاتصال، وليس رفع مستندات. يتم رفع المستندات المطلوبة لاحقًا ضمن طلب تقنين الأرض.',
  },
  {
    id: 'submit-application',
    category: 'تقديم الطلب',
    question: 'إزاي أقدم طلب تقنين؟',
    answer: 'بعد تسجيل الدخول، افتح ملفاتي واضغط تقديم طلب جديد. أدخل بيانات الأرض والمساحة وتفاصيل وضع اليد، ثم ارفع المستندات وراجع البيانات واضغط إنهاء والإرسال.',
  },
  {
    id: 'eligibility',
    category: 'تقديم الطلب',
    question: 'إيه شروط قبول الطلب؟',
    answer: 'يتم فحص كل حالة بمعرفة الجهة المختصة. من الشروط الإرشادية أن يكون مقدم الطلب مصري الجنسية وكامل الأهلية، وأن تكون بيانات الأرض والمستندات صحيحة، وأن تكون الحالة ضمن نطاق التقنين المعمول به.',
  },
  {
    id: 'processing-time',
    category: 'تقديم الطلب',
    question: 'كم يستغرق معالجة الطلب؟',
    answer: 'المدة تختلف حسب طبيعة الحالة واكتمال المستندات والإجراءات الميدانية. متوسط المدة الإرشادي للرحلة الكاملة من 30 إلى 45 يوم عمل، ولا يمثل ضمانًا بمدة أو نتيجة محددة.',
  },
  {
    id: 'edit-after-submit',
    category: 'تقديم الطلب',
    question: 'أقدر أعدل الطلب بعد تقديمه؟',
    answer: 'لا يمكن تعديل البيانات الأساسية بعد إرسال الطلب. راجع البيانات جيدًا قبل الإرسال، ويمكنك التواصل مع الفريق أو إضافة مستندات عند إتاحة ذلك لحالتك.',
  },
  {
    id: 'required-documents',
    category: 'المستندات',
    question: 'إيه المستندات المطلوبة للطلب؟',
    answer: 'بحسب الحالة قد تحتاج بطاقة الرقم القومي، ما يثبت وضع اليد، التوكيل أو مستندات الملكية إن وجدت، صور الأرض، والإيصالات أو المستندات الداعمة. قد تطلب الجهة المختصة مستندات إضافية.',
  },
  {
    id: 'file-formats',
    category: 'المستندات',
    question: 'إيه صيغة الملفات المقبولة؟',
    answer: 'ارفع الملفات بالصيغة التي يقبلها حقل المستند داخل الطلب، وتأكد أن الصورة أو الملف واضح وقابل للقراءة وغير محمي بكلمة مرور.',
  },
  {
    id: 'file-size',
    category: 'المستندات',
    question: 'أقصى حجم للملف إيه؟',
    answer: 'يظهر حد الرفع المطبق بجوار حقل المستند أثناء تقديم الطلب. إذا تعذر رفع الملف، صغّر حجمه مع الحفاظ على وضوح البيانات أو تواصل مع الدعم.',
  },
  {
    id: 'track-application',
    category: 'المتابعة والتتبع',
    question: 'إزاي أتابع حالة طلبي؟',
    answer: 'استخدم صفحة متابعة طلب وأدخل رقم التتبع، أو افتح ملفاتي بعد تسجيل الدخول. رقم التتبع يظهر بعد إرسال الطلب ويمكن استخدامه للوصول إلى آخر تحديثات الحالة.',
  },
  {
    id: 'stage-meaning',
    category: 'المتابعة والتتبع',
    question: 'إيه معنى كل مرحلة من مراحل الطلب؟',
    answer: 'المراحل تبدأ بتم التقديم، ثم المراجعة الأولية وفحص المستندات، وبعدها المعاينة والتسعير وعرض الطلب على اللجنة، ثم التعاقد. المرحلة منجز تعني إتمام الإجراء، بينما مرفوض تعني صدور قرار بالرفض.',
  },
  {
    id: 'rejected-application',
    category: 'المتابعة والتتبع',
    question: 'ليه الطلب بتاعي مرفوض؟',
    answer: 'سبب الرفض يحدده الفريق أو الجهة المختصة ويظهر ضمن تفاصيل الطلب أو الملاحظات عند توفره. يمكنك تقديم تظلم على الطلب المرفوض من صفحة التفاصيل.',
  },
  {
    id: 'inspection-fees',
    category: 'الرسوم والمدفوعات',
    question: 'كام رسوم المعاينة؟',
    answer: 'قيمة الرسوم تختلف حسب الحالة والجهة المختصة، وتظهر في تفاصيل الطلب عند تسجيلها. المنصة لا تعرض رقمًا موحدًا لأن التقييم يعتمد على بيانات كل طلب.',
  },
  {
    id: 'pay-fees',
    category: 'الرسوم والمدفوعات',
    question: 'إزاي أدفع الرسوم؟',
    answer: 'اتبع تعليمات الموظف المختص بعد ظهور الرسوم في الطلب، ثم احتفظ برقم الإيصال وارفعه أو أرسله بالطريقة المطلوبة حتى يتم تسجيل الدفعة.',
  },
  {
    id: 'payment-methods',
    category: 'الرسوم والمدفوعات',
    question: 'إيه طرق الدفع المتاحة؟',
    answer: 'طرق الدفع تعتمد على التعليمات المعتمدة للحالة والجهة المختصة. اسأل الفريق عن الطريقة المتاحة قبل الدفع، واحتفظ بإثبات السداد.',
  },
  {
    id: 'contract-timing',
    category: 'العقود',
    question: 'إمتى يتم توقيع العقد؟',
    answer: 'يبدأ التعاقد بعد استكمال المراجعة والمعاينة والتسعير واعتماد الطلب من الجهة المختصة. يتم تحديث مرحلة الطلب عند إنشاء العقد وتوقيعه.',
  },
  {
    id: 'after-approval',
    category: 'العقود',
    question: 'إيه الخطوات بعد قبول الطلب؟',
    answer: 'بعد القبول تستكمل إجراءات اللجنة والتعاقد، وقد تظهر موافقات داخلية أو طلبات سداد ومستندات إضافية. تابع الطلب حتى إنشاء العقد وتوقيعه وتحول الحالة إلى منجز.',
  },
  {
    id: 'submit-appeal',
    category: 'التظلمات',
    question: 'إزاي أقدم تظلم؟',
    answer: 'التظلم متاح للطلبات المرفوضة. افتح تفاصيل الطلب، اضغط تقديم تظلم، اكتب سبب التظلم والتفاصيل المطلوبة، ثم أرسل الطلب للمراجعة.',
  },
  {
    id: 'appeal-time',
    category: 'التظلمات',
    question: 'كم يستغرق الرد على التظلم؟',
    answer: 'تختلف المدة حسب طبيعة التظلم والجهة التي تراجعه. ستظهر النتيجة في تفاصيل التظلم، وقد يُعاد الطلب للمراجعة الأولية إذا تم قبول التظلم.',
  },
]

export default function HelpPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f8faf7]">
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
        <header className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1.5 text-[11px] font-bold shadow-sm">
            <BookOpen className="h-3.5 w-3.5 text-[#0d7a3e]" />
            مركز مساعدة المواطنين
          </div>
          <h1 className="mt-4 text-[28px] font-extrabold tracking-tight md:text-[36px]">مركز المساعدة</h1>
          <p className="mx-auto mt-3 max-w-[62ch] text-[14px] leading-8 text-black/60">
            إجابات واضحة عن التسجيل وتقديم الطلبات والمستندات والمتابعة حتى التعاقد.
          </p>
        </header>

        <section className="mt-8 rounded-[24px] border border-black/5 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] md:p-8">
          <HelpAccordion items={HELP_ITEMS} defaultOpen="create-account" />
        </section>

        <section className="mt-6 rounded-[24px] bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] p-6 text-white md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[20px] font-extrabold">لسه عندك سؤال؟</h2>
              <p className="mt-2 text-[13px] leading-7 text-white/80">فريقنا جاهز يساعدك في أي استفسار متعلق بطلبك.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/contact" className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-bold text-[#0d7a3e]">
                <MessageCircle className="h-4 w-4" /> تواصل معنا
              </Link>
              <a href="https://wa.me/201113999179" className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-[13px] font-bold text-white hover:bg-white/10" dir="ltr">
                <Phone className="h-4 w-4" /> 01113999179
              </a>
            </div>
          </div>
          <div className="mt-5 text-[11px] text-white/70">سجل تجاري 157574 منذ 2004</div>
        </section>

        <nav aria-label="روابط المساعدة" className="mt-8 flex flex-wrap justify-center gap-3 text-[12px] font-bold">
          <Link href="/" className="rounded-full border border-black/10 bg-white px-4 py-2 hover:border-[#0d7a3e]">الرئيسية</Link>
          <Link href="/guide" className="rounded-full border border-black/10 bg-white px-4 py-2 hover:border-[#0d7a3e]">دليل المستخدم</Link>
          <Link href="/track" className="inline-flex items-center gap-1.5 rounded-full bg-[#0d7a3e] px-4 py-2 text-white hover:bg-[#0a5c2f]">
            متابعة طلب <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </main>

      <PublicFooter />
    </div>
  )
}