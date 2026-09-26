'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as maplibregl from 'maplibre-gl'

if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')
}
import 'maplibre-gl/dist/maplibre-gl.css'
import { Search, MapPin, Loader2, X, Crosshair } from 'lucide-react'

type Props = {
  lat: string
  lng: string
  onChange: (lat: string, lng: string) => void
  height?: number
}

type GeocodeResult = {
  lat: string
  lon: string
  display_name: string
  place_id: number
}

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'
const EGYPT_CENTER: [number, number] = [30.8, 26.8]
const EGYPT_ZOOM = 5.5
const DETAIL_ZOOM = 14

export default function LandMapPicker({ lat, lng, onChange, height = 360 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const [ready, setReady] = useState(false)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const latNum = lat ? parseFloat(lat) : NaN
  const lngNum = lng ? parseFloat(lng) : NaN
  const hasCoords = !isNaN(latNum) && !isNaN(lngNum)

  const applyPosition = useCallback(
    (newLat: number, newLng: number) => {
      onChange(newLat.toFixed(6), newLng.toFixed(6))
    },
    [onChange]
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const initialCenter: [number, number] = hasCoords ? [lngNum, latNum] : EGYPT_CENTER
    const initialZoom = hasCoords ? DETAIL_ZOOM : EGYPT_ZOOM

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: { compact: true },
    })
    mapRef.current = map

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')

    map.on('load', () => setReady(true))

    map.on('click', (e: maplibregl.MapMouseEvent) => {
      const { lng: clickLng, lat: clickLat } = e.lngLat
      applyPosition(clickLat, clickLng)
    })

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return

    if (!hasCoords) {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      return
    }

    if (markerRef.current) {
      markerRef.current.setLngLat([lngNum, latNum])
    } else {
      const marker = new maplibregl.Marker({ color: '#0d7a3e', draggable: true })
        .setLngLat([lngNum, latNum])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            `<div style="font-family:system-ui;font-size:12px;direction:ltr">${latNum.toFixed(6)}, ${lngNum.toFixed(6)}</div>`
          )
        )
        .addTo(map)

      marker.on('dragend', () => {
        const pos = marker.getLngLat()
        applyPosition(pos.lat, pos.lng)
      })

      markerRef.current = marker
    }
  }, [ready, hasCoords, latNum, lngNum, applyPosition])

  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setResults([])
      setShowResults(false)
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
        if (!res.ok) return
        const data = await res.json()
        setResults(data.results || [])
        setShowResults(true)
      } catch {
        // silent
      } finally {
        setSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelectResult = (r: GeocodeResult) => {
    const newLat = parseFloat(r.lat)
    const newLng = parseFloat(r.lon)
    applyPosition(newLat, newLng)

    const map = mapRef.current
    if (map) {
      map.flyTo({ center: [newLng, newLat], zoom: DETAIL_ZOOM, duration: 800 })
    }

    setShowResults(false)
    setQuery('')
    setResults([])
  }

  const handleGeolocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude
        const newLng = pos.coords.longitude
        applyPosition(newLat, newLng)
        const map = mapRef.current
        if (map) {
          map.flyTo({ center: [newLng, newLat], zoom: DETAIL_ZOOM, duration: 800 })
        }
      },
      () => {
        // silent
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const clearCoords = () => {
    onChange('', '')
    setQuery('')
    setResults([])
    setShowResults(false)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 h-11 focus-within:border-[#0d7a3e] transition">
          <Search className="w-4 h-4 text-black/40 shrink-0" />
          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-black/35"
            placeholder="ابحث عن عنوان أو قرية أو علامة مميزة..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
          />
          {searching && <Loader2 className="w-4 h-4 text-black/40 animate-spin shrink-0" />}
          {query && !searching && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setResults([])
                setShowResults(false)
              }}
              className="text-black/40 hover:text-black/70 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showResults && results.length > 0 && (
          <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-black/10 rounded-xl shadow-lg max-h-72 overflow-y-auto">
            {results.map((r) => (
              <button
                key={r.place_id}
                type="button"
                onClick={() => handleSelectResult(r)}
                className="w-full text-right px-3 py-2 hover:bg-[#f0faf4] text-[12px] border-b border-black/5 last:border-b-0 flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-[#0d7a3e] mt-0.5 shrink-0" />
                <span className="text-black/70 leading-6">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="rounded-xl overflow-hidden border border-black/10"
        style={{ height }}
      />

      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <button
          type="button"
          onClick={handleGeolocate}
          className="h-9 px-3 rounded-full border border-black/10 hover:bg-black/5 font-bold flex items-center gap-1.5"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>استخدم موقعي الحالي</span>
        </button>

        {hasCoords ? (
          <>
            <div
              className="h-9 px-3 rounded-full bg-[#f0faf4] border border-[#0d7a3e]/20 font-mono text-[11px] flex items-center text-black/80"
              dir="ltr"
            >
              {latNum.toFixed(6)}, {lngNum.toFixed(6)}
            </div>
            <button
              type="button"
              onClick={clearCoords}
              className="h-9 px-3 rounded-full border border-red-200 text-red-600 hover:bg-red-50 font-bold"
            >
              مسح الموقع
            </button>
          </>
        ) : (
          <div className="h-9 px-3 rounded-full bg-[#f9fbf9] border border-black/5 text-black/50 flex items-center">
            لم تحدد موقعًا بعد — انقر على الخريطة أو ابحث
          </div>
        )}
      </div>
    </div>
  )
}