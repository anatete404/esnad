'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

export type HelpItem = {
  id: string
  question: string
  answer: string | React.ReactNode
  category?: string
}

type Props = {
  items: HelpItem[]
  defaultOpen?: string
}

export default function HelpAccordion({ items, defaultOpen }: Props) {
  const categories = ['الكل', ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))] as string[]
  const [activeCategory, setActiveCategory] = useState('الكل')
  const [openId, setOpenId] = useState<string | null>(defaultOpen || null)

  const visibleItems = activeCategory === 'الكل'
    ? items
    : items.filter((item) => item.category === activeCategory)

  return (
    <div dir="rtl">
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="تصنيفات الأسئلة">
        {categories.map((category) => {
          const isActive = activeCategory === category
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setActiveCategory(category)
                setOpenId(null)
              }}
              className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-bold transition ${
                isActive
                  ? 'border-[#0d7a3e] bg-[#0d7a3e] text-white'
                  : 'border-black/10 bg-white text-black/65 hover:border-[#0d7a3e]/40 hover:text-[#0d7a3e]'
              }`}
            >
              {category}
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        {visibleItems.map((item) => {
          const isOpen = openId === item.id
          const panelId = `help-answer-${item.id}`

          return (
            <div
              key={item.id}
              className={`rounded-[16px] border bg-white transition-all ${
                isOpen
                  ? 'border-[#0d7a3e]/30 shadow-[0_8px_24px_rgba(13,122,62,0.06)]'
                  : 'border-black/5 hover:border-black/10'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-right"
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span className={`flex items-center gap-2 text-[13px] font-bold md:text-[14px] ${isOpen ? 'text-[#0d7a3e]' : 'text-black'}`}>
                  <HelpCircle className="h-4 w-4 shrink-0 text-[#0d7a3e]" />
                  {item.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-black/40 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#0d7a3e]' : ''}`}
                />
              </button>
              <div
                id={panelId}
                role="region"
                aria-hidden={!isOpen}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="border-t border-black/5 px-5 pb-5 pt-3 text-[13px] leading-7 text-black/70">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}