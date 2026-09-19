import Link from 'next/link'
import { ArrowLeft, CheckCircle2, FileText, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'سياسة الخصوصية | منصة إسناد للتنمية الزراعية',
  description: 'سياسة الخصوصية وحماية بيانات مستخدمي منصة إسناد للتنمية الزراعية',
}

function Breadcrumbs() {
  return (
    <nav aria-label="مسار التنقل" className="flex flex-wrap items-center gap-2 text-[12px] text-black/50">
      <Link href="/" className="hover:text-[#0d7a3e]">الرئيسية</Link>
      <span aria-hidden="true">/</span>
      <span className="font-semibold text-black/70">سياسة الخصوصية</span>
    </nav>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-black/5 bg-white p-5 shadow-sm md:p-7">
      <h2 className="text-[18px] font-extrabold md:text-[20px]">{title}</h2>
      <div className="mt-3 text-[13px] leading-8 text-black/70 md:text-[14px]">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
      <Breadcrumbs />

      <header className="mt-6 border-b-2 border-[#0d7a3e]/20 pb-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-[14px] bg-[#0d7a3e]/10">
          <ShieldCheck className="h-6 w-6 text-[#0d7a3e]" />
        </div>
        <h1 className="mt-4 text-[28px] font-extrabold tracking-tight md:text-[36px]">سياسة الخصوصية</h1>
        <p className="mx-auto mt-3 max-w-[62ch] text-[14px] leading-8 text-black/60">
          نلتزم في منصة إسناد للتنمية الزراعية بحماية بياناتك واستخدامها بمسؤولية وشفافية.
        </p>
        <p className="mt-3 text-[11px] font-bold text-black/45">آخر تحديث: 2026-09-19</p>
      </header>

      <div className="mt-8 space-y-5">
        <Section title="مقدمة">
          <p>
            توضح هذه السياسة كيفية جمع واستخدام وحماية البيانات الشخصية عند استخدام منصة إسناد للتنمية الزراعية، المملوكة لمؤسسة حسن حسن علي لاستصلاح الأراضي، والمسجلة بسجل تجاري رقم 157574 منذ عام 2004.
          </p>
          <p className="mt-2">
            باستخدام المنصة، فإنك تقر بأنك قرأت هذه السياسة وفهمت طريقة التعامل مع بياناتك وفقاً لما هو موضح أدناه.
          </p>
        </Section>

        <Section title="البيانات التي نجمعها">
          <ul className="list-disc space-y-1 pr-5 marker:text-[#0d7a3e]">
            <li>الاسم والرقم القومي وبيانات التعريف الأساسية.</li>
            <li>بيانات الاتصال مثل رقم الهاتف والبريد الإلكتروني.</li>
            <li>المستندات والملفات التي ترفعها لدعم طلبك.</li>
            <li>بيانات الاستخدام والتفاعل مع المنصة وسجل الإجراءات المرتبطة بالطلب.</li>
          </ul>
        </Section>

        <Section title="كيف نستخدم البيانات">
          <ul className="list-disc space-y-1 pr-5 marker:text-[#0d7a3e]">
            <li>استقبال ومعالجة طلبات تقنين أوضاع الأراضي ومتابعتها.</li>
            <li>التواصل معك بشأن الطلبات والتنبيهات والدعم.</li>
            <li>إعداد الإحصائيات وتحسين جودة الخدمات وأداء المنصة.</li>
            <li>الالتزام بالمتطلبات القانونية والتنظيمية وحماية حقوق المنصة والمستخدمين.</li>
          </ul>
        </Section>

        <Section title="مشاركة البيانات">
          <p>
            لا نبيع بياناتك الشخصية ولا نؤجرها لأي طرف. قد تتم مشاركة البيانات بالقدر اللازم مع الجهات الحكومية المختصة أو الجهات التي يجيز القانون التعامل معها، وذلك لأغراض فحص الطلبات واستكمال الإجراءات الرسمية.
          </p>
        </Section>

        <Section title="حماية البيانات">
          <p>
            نستخدم إجراءات تقنية وتنظيمية مناسبة لحماية بياناتك، من بينها تشفير كلمات المرور باستخدام bcryptjs، وتأمين الجلسات باستخدام JWT، وتطبيق صلاحيات الوصول القائمة على الأدوار RBAC، بالإضافة إلى Audit Log كامل لتتبع الإجراءات المهمة.
          </p>
        </Section>

        <Section title="حقوق المستخدم">
          <p>يحق لك، في حدود القانون، طلب:</p>
          <ul className="mt-2 list-disc space-y-1 pr-5 marker:text-[#0d7a3e]">
            <li>الاطلاع على بياناتك المحفوظة.</li>
            <li>تصحيح البيانات غير الدقيقة أو غير المكتملة.</li>
            <li>حذف البيانات عندما لا يوجد التزام قانوني بالاحتفاظ بها.</li>
            <li>الاعتراض على بعض أوجه استخدام البيانات أو طلب تقييدها.</li>
          </ul>
        </Section>

        <Section title="ملفات تعريف الارتباط (Cookies)">
          <p>تستخدم المنصة ملفات تعريف ارتباط ضرورية للجلسة وتسجيل الدخول فقط، ولا نستخدمها لتتبع نشاطك الإعلاني عبر مواقع أخرى.</p>
        </Section>

        <Section title="مدة الاحتفاظ بالبيانات">
          <p>
            نحتفظ بالبيانات والمستندات للمدة اللازمة لمعالجة الطلبات وإتمام الإجراءات الرسمية والوفاء بالالتزامات القانونية، ثم يتم حذفها أو أرشفتها وفقاً للسياسات الداخلية والمتطلبات القانونية المعمول بها.
          </p>
        </Section>

        <Section title="التعديلات على السياسة">
          <p>
            قد نحدّث هذه السياسة عند الحاجة لمواكبة التغييرات القانونية أو التشغيلية. سيتم نشر النسخة المحدثة على هذه الصفحة مع تعديل تاريخ آخر تحديث، ويُعد استمرار استخدام المنصة بعد النشر قبولاً بالتعديلات.
          </p>
        </Section>

        <section className="rounded-[20px] bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] p-6 text-white md:p-7">
          <h2 className="flex items-center gap-2 text-[18px] font-extrabold">
            <FileText className="h-5 w-5" /> التواصل بشأن الخصوصية
          </h2>
          <p className="mt-3 text-[13px] leading-7 text-white/85">للاستفسارات أو ممارسة حقوقك، تواصل معنا عبر:</p>
          <div className="mt-3 flex flex-col gap-2 text-[13px] font-bold sm:flex-row sm:gap-6">
            <a href="tel:01113999179" className="underline" dir="ltr">01113999179</a>
            <a href="mailto:Elhassan22003@gmail.com" className="underline">Elhassan22003@gmail.com</a>
          </div>
        </section>
      </div>

      <nav aria-label="روابط قانونية" className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[12px] font-bold">
        <Link href="/" className="rounded-full border border-black/10 px-4 py-2 hover:border-[#0d7a3e]">الرئيسية</Link>
        <Link href="/legal/terms" className="rounded-full border border-black/10 px-4 py-2 hover:border-[#0d7a3e]">شروط الاستخدام</Link>
        <Link href="/contact" className="inline-flex items-center gap-1.5 rounded-full bg-[#0d7a3e] px-4 py-2 text-white hover:bg-[#0a5c2f]">
          تواصل معنا <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </nav>

      <div className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-black/45">
        <CheckCircle2 className="h-3.5 w-3.5 text-[#0d7a3e]" />
        <span>منصة إسناد للتنمية الزراعية — سجل تجاري 157574</span>
      </div>
    </div>
  )
}