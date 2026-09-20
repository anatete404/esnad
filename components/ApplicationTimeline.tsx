'use client'

type Props = {
  stage: string
  status: string
  stages?: Array<{ toStage: string; createdAt: string | Date }>
}

const STAGES = [
  { num: 1, key: 'SUBMITTED', label: 'تم التقديم' },
  { num: 2, key: 'INITIAL_REVIEW', label: 'مراجعة أولية' },
  { num: 3, key: 'DOCS_REVIEW', label: 'فحص المستندات' },
  { num: 4, key: 'SURVEY', label: 'معاينة ميدانية' },
  { num: 5, key: 'PRICING', label: 'تسعير' },
  { num: 6, key: 'COMMITTEE', label: 'عرض على اللجنة' },
  { num: 7, key: 'CONTRACT', label: 'تعاقد' },
  { num: 8, key: 'COMPLETED', label: 'منجز' },
  { num: 9, key: 'REJECTED', label: 'مرفوض' },
]

export default function ApplicationTimeline({ stage, status, stages = [] }: Props) {
  const isRejected = status === 'REJECTED' || stage === 'REJECTED'
  const currentIndex = Math.max(0, STAGES.findIndex((item) => item.key === stage))
  const rejectedFromIndex = [...stages]
    .reverse()
    .map((entry) => STAGES.findIndex((item) => item.key === entry.toStage))
    .find((index) => index >= 0 && STAGES[index]?.key !== 'REJECTED') ?? -1

  const getState = (index: number): 'completed' | 'current' | 'future' | 'rejected' => {
    if (isRejected) {
      if (STAGES[index]?.key === 'REJECTED') return 'rejected'
      return index <= rejectedFromIndex ? 'completed' : 'future'
    }
    if (currentIndex > index) return 'completed'
    if (currentIndex === index) return 'current'
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
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-600',
      label: 'text-red-600',
    },
  }

  return (
    <div className="w-full bg-white rounded-[20px] border border-black/5 p-5 md:p-6 shadow-sm">
      <div className="flex items-start gap-2 md:gap-3" dir="rtl">
        {/* بداية */}
        <div className="shrink-0 rounded-lg bg-[#0d7a3e] px-2 py-1.5 text-[10px] font-bold text-white md:px-3 md:text-[12px]">
          بداية
        </div>

        {/* Steps */}
        <div className="flex min-w-max flex-1 items-start">
          {STAGES.map((step, i) => {
            const state = getState(i)
            const c = colors[state]

            const prevState = i > 0 ? getState(i - 1) : null
            const lineBg =
              prevState === 'completed'
                ? 'bg-[#0d7a3e]'
                : prevState === 'current'
                  ? 'bg-[#f59e0b]'
                  : prevState === 'rejected'
                    ? 'bg-red-500'
                    : 'bg-black/10'

            return (
              <div key={step.key} className="flex min-w-[58px] items-start md:min-w-[84px]">
                {i > 0 && (
                  <div
                    className={`mt-[14px] h-0.5 w-3 rounded-full transition-colors lg:mt-[18px] lg:h-1 lg:w-6 ${lineBg}`}
                  />
                )}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={`grid h-7 w-7 place-items-center rounded-full border-2 shadow-sm md:h-10 md:w-10 ${c.border} ${c.bg}`}
                  >
                    <span
                      className={`text-[10px] font-extrabold md:text-xs ${c.text}`}
                    >
                      {step.num}
                    </span>
                  </div>
                  <div
                    className={`mt-1 min-h-[30px] max-w-[52px] text-center text-[8px] font-bold leading-tight md:mt-2 md:text-xs ${c.label}`}
                  >
                    {step.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* نهاية */}
        <div className="shrink-0 rounded-lg bg-[#0d7a3e]/10 px-2 py-1.5 text-[10px] font-bold text-[#0d7a3e] md:px-3 md:text-[12px]">
          نهاية
        </div>
      </div>

      {isRejected && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-center">
          <div className="text-[12px] md:text-[13px] font-bold text-red-700">
            تم رفض هذا الطلب
          </div>
        </div>
      )}

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
