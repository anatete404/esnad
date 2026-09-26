import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type NominatimResult = {
  place_id: number
  lat: string
  lon: string
  display_name: string
  type?: string
}

const CACHE_TTL_MS = 5 * 60 * 1000
const cache = new Map<string, { at: number; data: NominatimResult[] }>()

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') || '').trim()

  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] })
  }

  if (q.length > 200) {
    return NextResponse.json({ error: 'query too long' }, { status: 400 })
  }

  const key = q.toLowerCase()
  const cached = cache.get(key)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json({ results: cached.data, cached: true })
  }

  const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search')
  nominatimUrl.searchParams.set('q', q)
  nominatimUrl.searchParams.set('format', 'json')
  nominatimUrl.searchParams.set('limit', '5')
  nominatimUrl.searchParams.set('countrycodes', 'eg')
  nominatimUrl.searchParams.set('accept-language', 'ar,en')

  try {
    const res = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'Esnad-Platform/1.0 (https://hassan-platform.vercel.app; contact: Elhassan22003@gmail.com)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      return NextResponse.json({ results: [] })
    }

    const data = (await res.json()) as NominatimResult[]
    const results = data.map((r) => ({
      place_id: r.place_id,
      lat: r.lat,
      lon: r.lon,
      display_name: r.display_name,
    }))

    cache.set(key, { at: Date.now(), data: results })
    if (cache.size > 200) {
      const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at)[0]
      if (oldest) cache.delete(oldest[0])
    }

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}