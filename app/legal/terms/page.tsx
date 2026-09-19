import Link from 'next/link'
import { ArrowLeft, FileSignature, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'شروط الاستخدام | منصة إسناد للتنمية الزراعية',
  description: 'شروط وأحكام استخدام منصة إسناد للتنمية الزراعية',
}

function Breadcrumbs() {
  return (
    <nav aria-label="مسار التنقل" className="flex flex-wrap items-center gap-2 text-[12px] text-black/50">
      <Link href="/" className="hover:text-[#0d7a3e]">الرئيسية</Link>
      <span aria-hidden="true">/</span>
      <span className="font-semibold text-black/70">شروط الاستخدام</span>
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

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12">
      <Breadcrumbs />

      <header className="mt-6 border-b-2 border-[#0d7a3e]/20 pb-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-[14px] bg-[#0d7a3e]/10">
          <FileSignature className="h-6 w-6 text-[#0d7a3e]" />
        </div>
        <h1 className="mt-4 text-[28px] font-extrabold tracking-tight md:text-[36px]">شروط الاستخدام</h1>
        <p className="mx-auto mt-3 max-w-[62ch] text-[14px] leading-8 text-black/60">
          تنظم هذه الشروط استخدامك لمنصة إسناد للتنمية الزراعية وخدماتها الإلكترونية.
        </p>
        <p className="mt-3 text-[11px] font-bold text-black/45">آخر تحديث: 2026-09-19</p>
      </header>

      <div className="mt-8 space-y-5">
        <Section title="قبول الشروط">
          <p>
            بإنشاء حساب أو استخدام أي خدمة في منصة إسناد للتنمية الزراعية، فإنك توافق على الالتزام بهذه الشروط وبسياسة الخصوصية. إذا كنت لا توافق عليها، يرجى عدم استخدام المنصة.
          </p>
        </Section>

        <Section title="وصف الخدمة">
          <p>
            توفر المنصة أدوات إلكترونية لتقديم ومتابعة طلبات تقنين أوضاع الأراضي، ورفع المستندات، واستقبال الإشعارات والتحديثات المتعلقة بالطلب. المنصة وسيلة للتقديم والمتابعة، ولا تمثل موافقة مسبقة أو ضماناً لقبول أي طلب.
          </p>
        </Section>

        <Section title="التسجيل والحساب">
          <ul className="list-disc space-y-1 pr-5 marker:text-[#0d7a3e]">
            <li>يلتزم المستخدم بتقديم بيانات صحيحة وكاملة ومحدثة.</li>
            <li>يجب استخدام الحساب من صاحبه وعدم مشاركة بيانات الدخول مع الآخرين.</li>
            <li>يتحمل المستخدم مسؤولية الحفاظ على كلمة المرور والإبلاغ فوراً عن أي استخدام غير مصرح به.</li>
            <li>يجوز طلب التحقق من البيانات أو المستندات عند الحاجة لاستكمال الإجراءات.</li>
          </ul>
        </Section>

        <Section title="مسؤوليات المستخدم">
          <ul className="list-disc space-y-1 pr-5 marker:text-[#0d7a3e]">
            <li>رفع مستندات صحيحة وسارية ومملوكة أو مصرح باستخدامها من صاحبها.</li>
            <li>مراجعة البيانات قبل إرسال الطلب والتعاون مع الجهة المختصة عند طلب معلومات إضافية.</li>
            <li>عدم انتحال شخصية الغير أو تقديم بيانات مضللة أو مستندات مزورة.</li>
            <li>عدم محاولة تعطيل المنصة أو الوصول غير المصرح به أو إساءة استخدام أي خدمة.</li>
          </ul>
        </Section>

        <Section title="الملكية الفكرية">
          <p>
            جميع أسماء المنصة وشعاراتها وواجهاتها ومحتوياتها البرمجية والنصية مملوكة أو مرخصة لمؤسسة حسن حسن علي لاستصلاح الأراضي، ولا يجوز نسخها أو إعادة استخدامها أو توزيعها دون موافقة كتابية مسبقة، باستثناء الاستخدام الشخصي المشروع للخدمة.
          </p>
        </Section>

        <Section title="إخلاء المسؤولية">
          <p>
            نبذل جهداً معقولاً للحفاظ على دقة المنصة واستمراريتها، لكن قد تتوقف بعض الخدمات مؤقتاً للصيانة أو لأسباب خارجة عن السيطرة. القرار النهائي بشأن الطلبات والمعاينات والاعتمادات يصدر من الجهة المختصة، ولا تتحمل المنصة مسؤولية نتيجة القرار الرسمي أو تأخره.
          </p>
        </Section>

        <Section title="تعليق أو إلغاء الحساب">
          <p>
            يجوز تعليق الحساب أو إلغاؤه عند مخالفة هذه الشروط، أو تقديم بيانات غير صحيحة، أو إساءة استخدام المنصة، أو وجود متطلبات قانونية تستدعي ذلك. لا يؤثر إلغاء الحساب على الالتزامات أو الحقوق التي نشأت قبل الإلغاء.
          </p>
        </Section>

        <Section title="القانون الواجب التطبيق">
          <p>تخضع هذه الشروط وتفسر وفقاً للقانون المصري، وتختص الجهات القضائية المصرية المختصة بالنظر في أي نزاع ينشأ عن استخدام المنصة.</p>
        </Section>

        <Section title="تعديل الشروط">
          <p>
            قد يتم تعديل هذه الشروط من وقت لآخر. ستُنشر النسخة المحدثة على هذه الصفحة مع تاريخ آخر تحديث، ويُعد استمرار استخدام المنصة بعد النشر موافقة على الشروط المعدلة.
          </p>
        </Section>

        <section className="rounded-[20px] bg-[#fbfaf2] p-6 md:p-7">
          <h2 className="flex items-center gap-2 text-[18px] font-extrabold">
            <ShieldCheck className="h-5 w-5 text-[#0d7a3e]" /> التواصل
          </h2>
          <p className="mt-3 text-[13px] leading-8 text-black/70">
            للاستفسارات المتعلقة بهذه الشروط، تواصل معنا على
            <a href="tel:01113999179" className="mx-1 font-bold text-[#0d7a3e] underline" dir="ltr">01113999179</a>
            أو عبر
            <a href="mailto:Elhassan22003@gmail.com" className="mx-1 font-bold text-[#0d7a3e] underline">Elhassan22003@gmail.com</a>.
          </p>
        </section>
      </div>

      <nav aria-label="روابط قانونية" className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[12px] font-bold">
        <Link href="/" className="rounded-full border border-black/10 px-4 py-2 hover:border-[#0d7a3e]">الرئيسية</Link>
        <Link href="/legal/privacy" className="rounded-full border border-black/10 px-4 py-2 hover:border-[#0d7a3e]">سياسة الخصوصية</Link>
        <Link href="/contact" className="inline-flex items-center gap-1.5 rounded-full bg-[#0d7a3e] px-4 py-2 text-white hover:bg-[#0a5c2f]">
          تواصل معنا <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </nav>
    </div>
  )
}