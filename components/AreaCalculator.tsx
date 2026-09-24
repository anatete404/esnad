'use client'

import { useState } from 'react'
import { Calculator, Info, Ruler } from 'lucide-react'

export default function AreaCalculator() {
  const [faddan, setFaddan] = useState('0')
  const [qirat, setQirat] = useState('0')
  const [sahm, setSahm] = useState('0')

  const f = parseFloat(faddan) || 0
  const q = parseFloat(qirat) || 0
  const s = parseFloat(sahm) || 0

  const totalMeters = f * 4200.83

  const isValid = f >= 0 && q >= 0 && q < 24 && s >= 0 && s < 576

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-12 md:px-6 md:py-16">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-black/5 shadow-sm text-[11px] font-bold">
          <Calculator className="w-3.5 h-3.5 text-[#0d7a3e]" />
          حاسبة المساحة
        </div>
        <h2 className="mt-4 text-[22px] md:text-[28px] font-extrabold">
          احسب مساحة أرضك بسهولة
        </h2>
        <p className="mt-2 text-[13px] text-black/60">
          أدخل الفدان والقيراط والسهم — والباقي علينا
        </p>
      </div>

      <div className="max-w-2xl mx-auto rounded-[24px] bg-white border border-black/5 p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div>
            <label className="block text-[11px] font-bold text-black/70 mb-1.5">
              فدان
            </label>
            <input
              type="number"
              min="0"
              value={faddan}
              onChange={(e) => setFaddan(e.target.value)}
              className="input text-center text-[16px] font-extrabold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-black/70 mb-1.5">
              قيراط <span className="text-black/40">(24=فدان)</span>
            </label>
            <input
              type="number"
              min="0"
              max="23"
              value={qirat}
              onChange={(e) => setQirat(e.target.value)}
              className="input text-center text-[16px] font-extrabold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-black/70 mb-1.5">
              سهم <span className="text-black/40">(576=فدان)</span>
            </label>
            <input
              type="number"
              min="0"
              max="575"
              value={sahm}
              onChange={(e) => setSahm(e.target.value)}
              className="input text-center text-[16px] font-extrabold"
            />
          </div>
        </div>

        {!isValid && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-[11px] text-red-700 font-semibold flex items-center gap-2">
            <Info className="w-3.5 h-3.5 shrink-0" />
            القيراط يجب أن يكون أقل من 24، والسهم أقل من 576
          </div>
        )}

        <div className="mt-6 rounded-[20px] bg-gradient-to-l from-[#0d7a3e] to-[#0a5c2f] text-white p-6">
          <div className="flex items-center gap-2 text-[12px] opacity-85 mb-3">
            <Ruler className="w-4 h-4" />
            المساحة الإجمالية
          </div>
          <div className="text-center">
            <div className="text-[36px] md:text-[42px] font-extrabold leading-none">
              {(Math.round(totalMeters * 100) / 100).toFixed(2)}
            </div>
            <div className="mt-2 text-[14px] opacity-90">متر</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="rounded-lg bg-white/10 p-2">
              <div className="opacity-70">بالمتر</div>
              <div className="mt-0.5 font-extrabold">{(Math.round(totalMeters * 100) / 100).toFixed(2)}</div>
            </div>
            <div className="rounded-lg bg-white/10 p-2">
              <div className="opacity-70">بالقيراط</div>
              <div className="mt-0.5 font-extrabold">{q}</div>
            </div>
            <div className="rounded-lg bg-white/10 p-2">
              <div className="opacity-70">بالسهم</div>
              <div className="mt-0.5 font-extrabold">{s}</div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-[#f0faf4] border border-[#0d7a3e]/20 p-3 text-[11px] leading-6 text-[#0d5a2e]">
          💡 <strong>ملاحظة:</strong> هذا الحساب تقديري. المساحة الرسمية تُحدد بناءً على المعاينة الميدانية.
        </div>
      </div>
    </section>
  )
}
