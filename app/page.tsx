import Link from 'next/link'
import {
  Building2,
  Download,
  FileText,
  Layers,
  Search,
  Shield,
  ShieldCheck,
  TrendingUp,
  Users,
  Users2,
  Zap,
} from 'lucide-react'
import HomeFaq from '@/components/HomeFaq'
import AnimatedCounter from '@/components/AnimatedCounter'
import AreaCalculator from '@/components/AreaCalculator'
import LiveStatus from '@/components/LiveStatus'
import ProcessTimeline from '@/components/ProcessTimeline'
import PublicFooter from '@/components/PublicFooter'
import PublicHeader from '@/components/PublicHeader'
import WhatsAppButton from '@/components/WhatsAppButton'
import { getCitizenSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function HomePage() {
  const session = await getCitizenSession()
  let userName: string | undefined

  if (session) {
    const citizen = await prisma.citizen.findUnique({
      where: { id: session.id },
      select: { fullName: true },
    })
    userName = citizen?.fullName
  }

  const [totalApplications, totalCitizens, completedApplications] = await Promise.all([
    prisma.application.count(),
    prisma.citizen.count(),
    prisma.application.count({ where: { status: 'COMPLETED' } }),
  ])

  const stats = [
    { icon: FileText, label: 'طلب مقدم', numericValue: totalApplications, suffix: '' },
    { icon: Users, label: 'مواطن مسجل', numericValue: totalCitizens, suffix: '' },
    { icon: TrendingUp, label: 'ملف منجز', numericValue: completedApplications, suffix: '' },
    { icon: Shield, label: 'دقة البيانات', numericValue: 100, suffix: '%' },
  ]

  const steps = [
    { n: 1, t: 'سجّل حسابك', d: 'بالرقم القومي ورقم هاتف فعّال' },
    { n: 2, t: 'قدّم طلبك', d: 'أدخل بيانات الأرض وارفع المستندات' },
    { n: 3, t: 'تابع حالة طلبك', d: 'برقم التتبع في أي وقت' },
    { n: 4, t: 'استلم عقدك', d: 'بعد اعتماد الجهة المختصة' },
  ]

  return (
    <>
      <PublicHeader userName={userName} />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0d7a3e]/8 to-transparent" />
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 pb-12 pt-12 md:px-6 md:pt-20 lg:grid-cols-[1.15fr_0.85fr] animate-fade-in">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1.5 text-[11px] font-bold shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#0d7a3e] animate-pulse" />
                منصة رسمية • إسناد للتنمية الزراعية
                <span className="rounded-full bg-[#c89a2c]/20 px-2 py-0.5 text-[#8a6a1f]">
                  س.ت 157574
                </span>
              </div>
              <LiveStatus />
            </div>

            <h1 className="mt-5 text-[28px] font-extrabold leading-[1.15] tracking-tight md:text-[44px]">
              منصة متكاملة لتقديم ومتابعة
              <br />
              <span className="bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] bg-clip-text text-transparent">
                طلبات تقنين الأراضي
              </span>
            </h1>

            <p className="mt-4 max-w-[62ch] text-[14px] font-medium leading-8 text-black/65 md:text-[16px]">
              خدمة إلكترونية متكاملة تمكّنك من تقديم طلب تقنين أرضك، رفع المستندات،
              ومتابعة حالة الطلب خطوة بخطوة حتى التعاقد النهائي — بشفافية وسرعة وأمان.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={session ? '/apply' : '/register'}
                className="flex h-12 items-center gap-2 rounded-full bg-[#0d7a3e] px-7 text-[14px] font-bold text-white shadow-[0_8px_24px_rgba(13,122,62,0.3)] transition hover:shadow-[0_10px_30px_rgba(13,122,62,0.4)]"
              >
                <FileText className="h-4 w-4" />
                {session ? 'قدّم طلب جديد' : 'ابدأ الآن'}
              </Link>
              <Link
                href="/track"
                className="flex h-12 items-center gap-2 rounded-full border border-black/10 bg-white px-7 text-[14px] font-bold transition hover:border-[#0d7a3e]"
              >
                <Search className="h-4 w-4 text-[#0d7a3e]" />
                متابعة طلب
              </Link>
              <a
                href="/api/guide"
                className="flex h-12 items-center gap-2 rounded-full border border-black/10 bg-white px-7 text-[14px] font-bold transition hover:border-[#0d7a3e]"
              >
                <Download className="h-4 w-4 text-[#0d7a3e]" />
                دليل المستخدم
              </a>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 stagger-children">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-[16px] border border-black/5 bg-white p-3.5 shadow-sm card-hover"
                >
                  <s.icon className="h-5 w-5 text-[#0d7a3e]" />
                  <div className="mt-2 text-[17px] font-extrabold">
                    <AnimatedCounter end={s.numericValue ?? 0} suffix={s.suffix ?? ''} />
                  </div>
                  <div className="text-[11px] font-semibold text-black/55">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-[#0d7a3e]/15 to-[#c89a2c]/20 blur-[40px]" />
            <div className="rounded-[24px] border border-black/5 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-2 text-[15px] font-extrabold">
                <Zap className="h-4 w-4 text-[#c89a2c]" />
                كيف تستخدم المنصة؟
              </div>

              <div className="mt-5 space-y-4">
                {steps.map((s) => (
                  <div key={s.n} className="flex items-start gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0d7a3e] text-[13px] font-extrabold text-white">
                      {s.n}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold">{s.t}</div>
                      <div className="text-[11px] text-black/55">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-[#0d7a3e]/20 bg-[#f0faf4] p-3 text-[11px] font-semibold leading-6 text-[#0d5a2e]">
                🔒 جميع بياناتك محفوظة ومشفرة. القرار النهائي للجهة المختصة فقط.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7-Stage Timeline */}
      <ProcessTimeline />

      {/* Area Calculator */}
      <AreaCalculator />

      <section className="mx-auto max-w-[1280px] px-4 py-12 md:px-6">
        <h2 className="text-center text-[22px] font-extrabold md:text-[28px]">
          لماذا منصتنا؟
        </h2>
        <p className="mt-2 text-center text-[13px] text-black/60">
          تجربة رقمية كاملة من البيت — بدون طوابير وبدون تعقيد
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { icon: Zap, t: 'سرعة في الإنجاز', d: 'متوسط زمن معالجة الطلب أقصر بنسبة 60%' },
            { icon: Shield, t: 'أمان وشفافية', d: 'تشفير كامل للبيانات وسجل تدقيق لكل إجراء' },
            { icon: TrendingUp, t: 'متابعة لحظية', d: 'اعرف حالة طلبك في أي وقت من أي مكان' },
            { icon: Users, t: 'دعم مخصص', d: 'فريق خدمة عملاء + رسائل SMS عند تغيّر الحالة' },
            { icon: FileText, t: 'أرشفة إلكترونية', d: 'كل مستنداتك محفوظة إلكترونياً بشكل آمن' },
            { icon: Search, t: 'رقم تتبع فريد', d: 'لكل طلب رقم تعريفي يمكنك تتبعه بسهولة' },
          ].map((f) => (
            <div
              key={f.t}
              className="rounded-[20px] border border-black/5 bg-white p-5 transition hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-[12px] bg-[#0d7a3e]/10">
                <f.icon className="h-5 w-5 text-[#0d7a3e]" />
              </div>
              <div className="mt-4 text-[14px] font-extrabold">{f.t}</div>
              <div className="mt-1 text-[12px] leading-6 text-black/60">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-16 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[24px] bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] p-8 text-white md:p-10">
          <div>
            <div className="text-[20px] font-extrabold md:text-[24px]">جاهز تقدم طلبك؟</div>
            <div className="mt-1 text-[13px] opacity-85">
              سجّل حسابك في دقيقة واحدة وابدأ رحلة التقنين الآن
            </div>
          </div>
          <Link
            href={session ? '/apply' : '/register'}
            className="flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[14px] font-bold text-black"
          >
            {session ? 'قدّم طلب جديد' : 'سجّل الآن مجاناً'}
          </Link>
        </div>
      </section>

      {/* Trust / Partners */}
      <section className="mx-auto max-w-[1280px] px-4 py-12 md:px-6 md:py-16">
        <div className="text-center mb-8">
          <div className="text-[11px] font-bold text-black/50 tracking-widest">TRUSTED BY</div>
          <h2 className="mt-3 text-[20px] md:text-[22px] font-extrabold">
            نعمل وفق معايير مؤسسية
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
          {[
            { icon: Building2, title: 'سجل تجاري', value: '157574' },
            { icon: Layers, title: 'سنوات الخبرة', value: '+22 سنة' },
            { icon: ShieldCheck, title: 'حماية البيانات', value: 'مشفّرة' },
            { icon: Users2, title: 'فريق متخصص', value: '11 دور' },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[16px] bg-white border border-black/5 p-5 text-center card-hover"
            >
              <div className="w-12 h-12 rounded-[12px] bg-[#0d7a3e]/10 grid place-items-center mx-auto">
                <item.icon className="w-5 h-5 text-[#0d7a3e]" />
              </div>
              <div className="mt-3 text-[18px] font-extrabold text-[#0d7a3e]">{item.value}</div>
              <div className="text-[11px] text-black/55 font-bold mt-1">{item.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <HomeFaq />

      <PublicFooter />
      <WhatsAppButton />
    </>
  )
}
