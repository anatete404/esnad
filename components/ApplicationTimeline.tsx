'use client'

import { Check, X } from 'lucide-react'

type Props = {
  stage: string
  status: string
}

const VISUAL_STEPS = [
  { num: 1, label: 'المراجعة', stages: ['SUBMITTED', 'INITIAL_REVIEW'] },
  { num: 2, label: 'سداد رسوم المعاينة', stages: ['DOCS_REVIEW'] },
  { num: 3, label: 'المعاينة والتسعير', stages: ['SURVEY', 'PRICING'] },
  { num: 4, label: 'التعاقد', stages: ['COMMITTEE', 'CONTRACT', 'COMPLETED'] },
]

function getVisualStep(stage: string): number {
  for (const s of VISUAL_STEPS) {
    if (s.stages.includes(stage)) return s.num
  }
  return 1
}

export default function ApplicationTimeline({ stage, status }: Props) {
  const isRejected = status === 'REJECTED' || stage === 'REJECTED'
  const currentStep = isRejected ? 0 : getVisualStep(stage)

  const getState = (num: number): 'completed' | 'current' | 'future' | 'rejected' => {
    if (isRejected) return 'rejected'
    if (currentStep > num) return 'completed'
    if (currentStep === num) return 'current'
    return 'future'
  }

  const colors = {
    completed: {
      bg: 'bg-[#0d7a3e]',
      border: 'border-[#0d7a3e]',
      text: 'text-white',
      label: 'text-[#0d7a3e]',
    },
    current: {
      bg: 'bg-[#f59e0b]',
      border: 'border-[#f59e0b]',
      text: 'text-white',
      label: 'text-[#f59e0b]',
    },
    future: {
      bg: 'bg-white',
      border: 'border-black/15',
      text: 'text-black/30',
      label: 'text-black/40',
    },
    rejected: {
      bg: 'bg-red-500',
      border: 'border-red-500',
      text: 'text-white',
      label: 'text-red-500',
    },
  }

  return (
    <div className="w-full bg-white rounded-[20px] border border-black/5 p-5 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 md:gap-3" dir="rtl">
        {/* بداية */}
        <div className="px-3 py-1.5 rounded-lg bg-[#0d7a3e] text-white text-[11px] md:text-[12px] font-bold shrink-0">
          بداية
        </div>

        {/* Steps */}
        <div className="flex items-center flex-1 min-w-0">
          {VISUAL_STEPS.map((step, i) => {
            const state = getState(step.num)
            const c = colors[state]

            const prevState = i > 0 ? getState(VISUAL_STEPS[i - 1].num) : null
            const lineBg =
              prevState === 'completed'
                ? 'bg-[#0d7a3e]'
                : prevState === 'current'
                  ? 'bg-[#f59e0b]'
                  : prevState === 'rejected'
                    ? 'bg-red-500'
                    : 'bg-black/10'

            return (
              <div key={step.num} className="flex items-center flex-1 min-w-0">
                {i > 0 && (
                  <div className={`flex-1 h-1 rounded-full transition-colors ${lineBg}`} />
                )}
                <div className="flex flex-col items-center gap-1.5 md:gap-2 shrink-0">
                  <div
                    className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-2 ${c.border} ${c.bg} grid place-items-center shadow-sm`}
                  >
                    {state === 'completed' ? (
                      <Check
                        className="w-5 h-5 md:w-6 md:h-6 text-white"
                        strokeWidth={3}
                      />
                    ) : state === 'rejected' ? (
                      <X
                        className="w-5 h-5 md:w-6 md:h-6 text-white"
                        strokeWidth={3}
                      />
                    ) : (
                      <span
                        className={`text-[14px] md:text-[18px] font-extrabold ${c.text}`}
                      >
                        {step.num}
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-[9px] md:text-[11px] font-bold text-center max-w-[68px] md:max-w-[110px] leading-tight ${c.label}`}
                  >
                    {step.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* نهاية */}
        <div className="px-3 py-1.5 rounded-lg bg-[#f59e0b] text-white text-[11px] md:text-[12px] font-bold shrink-0">
          نهاية
        </div>
      </div>

      {/* Rejected banner */}
      {isRejected && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-center">
          <div className="text-[12px] md:text-[13px] font-bold text-red-700">
            تم رفض هذا الطلب
          </div>
        </div>
      )}

      {/* On hold banner */}
      {status === 'ON_HOLD' && !isRejected && (
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-center">
          <div className="text-[12px] md:text-[13px] font-bold text-amber-800">
            الطلب معلّق — بانتظار إجراء
          </div>
        </div>
      )}
    </div>
  )
}
