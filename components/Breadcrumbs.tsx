'use client'

import Link from 'next/link'
import { ChevronLeft, Home } from 'lucide-react'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type Props = {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav className="flex items-center gap-1 text-[12px] mb-3 text-black/60" aria-label="مسار التنقل">
      <Link href="/portal" className="flex items-center gap-1 hover:text-[#0d7a3e] transition font-semibold">
        <Home className="w-3.5 h-3.5" />
        <span>الرئيسية</span>
      </Link>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5 text-black/30" />
          {item.href ? (
            <Link href={item.href} className="hover:text-[#0d7a3e] transition font-semibold">
              {item.label}
            </Link>
          ) : (
            <span className="font-bold text-black">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
