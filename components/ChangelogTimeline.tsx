import { ArrowUp, Bug, Sparkles } from 'lucide-react'

export type ChangelogEntry = {
  date: string
  version?: string
  title: string
  description: string
  type: 'feature' | 'fix' | 'improvement'
  icon?: string
}

type Props = {
  entries: ChangelogEntry[]
}

const TYPE_STYLES = {
  feature: {
    label: 'ميزة جديدة',
    icon: Sparkles,
    color: '#0d7a3e',
    softColor: '#f0faf4',
  },
  fix: {
    label: 'إصلاح',
    icon: Bug,
    color: '#c2413b',
    softColor: '#fff3f2',
  },
  improvement: {
    label: 'تحسين',
    icon: ArrowUp,
    color: '#2563a6',
    softColor: '#eff6ff',
  },
} as const

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

export default function ChangelogTimeline({ entries }: Props) {
  return (
    <div className="relative">
      <div className="absolute bottom-5 right-[15px] top-5 w-px bg-black/10 md:right-[19px]" aria-hidden="true" />
      <div className="space-y-5">
        {entries.map((entry) => {
          const style = TYPE_STYLES[entry.type]
          const Icon = style.icon

          return (
            <article key={`${entry.date}-${entry.title}`} className="relative flex items-start gap-4 md:gap-5">
              <div
                className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-4 border-[#f8faf7] text-white md:h-10 md:w-10"
                style={{ backgroundColor: style.color }}
                aria-hidden="true"
              >
                <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </div>

              <div className="min-w-0 flex-1 rounded-[20px] border border-black/5 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.035)] md:p-5">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                  <time dateTime={entry.date} className="text-black/45">
                    {formatDate(entry.date)}
                  </time>
                  {entry.version && (
                    <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-black/60">
                      {entry.version}
                    </span>
                  )}
                  <span
                    className="rounded-full px-2.5 py-1"
                    style={{ backgroundColor: style.softColor, color: style.color }}
                  >
                    {style.label}
                  </span>
                </div>
                <h2 className="mt-3 text-[15px] font-extrabold md:text-[16px]">{entry.title}</h2>
                <p className="mt-1.5 text-[12px] leading-7 text-black/60 md:text-[13px]">{entry.description}</p>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
