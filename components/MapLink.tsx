'use client'

import { ExternalLink, MapPin } from 'lucide-react'

type Props = {
  lat: string | null
  lng: string | null
  label?: string
}

export default function MapLink({ lat, lng, label = 'عرض على الخريطة' }: Props) {
  if (!lat || !lng) {
    return (
      <div className="rounded-xl bg-[#f9fbf9] border border-black/5 p-3">
        <div className="text-[10px] text-black/50 font-bold">الإحداثيات</div>
        <div className="mt-1 text-[12px] text-black/40">غير محددة</div>
      </div>
    )
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

  return (
    <a
      href={googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl bg-[#f0faf4] border border-[#0d7a3e]/20 p-3 hover:bg-[#e8f4ed] transition group"
    >
      <div className="text-[10px] text-black/50 font-bold">الإحداثيات</div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="text-[12px] font-bold font-mono text-black/85" dir="ltr">
          {lat}, {lng}
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-[#0d7a3e]">
          <MapPin className="w-3 h-3" />
          <span>{label}</span>
          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition" />
        </div>
      </div>
    </a>
  )
}
