'use client'

import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'

if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')
}
import 'maplibre-gl/dist/maplibre-gl.css'

type Props = {
  lat: string | null
  lng: string | null
  height?: number
}

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'

export default function LandMap({ lat, lng, height = 260 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)

  const latNum = lat ? parseFloat(lat) : NaN
  const lngNum = lng ? parseFloat(lng) : NaN
  const hasCoords = !isNaN(latNum) && !isNaN(lngNum)

  useEffect(() => {
    if (!containerRef.current || !hasCoords) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [lngNum, latNum],
      zoom: 13,
      attributionControl: { compact: true },
    })
    mapRef.current = map

    const marker = new maplibregl.Marker({ color: '#0d7a3e' })
      .setLngLat([lngNum, latNum])
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(
          `<div style="font-family:system-ui;font-size:12px;direction:ltr">${latNum.toFixed(6)}, ${lngNum.toFixed(6)}</div>`
        )
      )
      .addTo(map)
    markerRef.current = marker

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')

    return () => {
      marker.remove()
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [latNum, lngNum, hasCoords])

  if (!hasCoords) {
    return (
      <div
        className="rounded-xl bg-[#f9fbf9] border border-black/5 grid place-items-center"
        style={{ height }}
      >
        <div className="text-[12px] text-black/50">لم يتم تحديد الموقع على الخريطة بعد</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-hidden border border-black/5"
      style={{ height }}
    />
  )
}