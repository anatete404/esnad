import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { UserGuidePdf } from '@/lib/userGuidePdf'

export async function GET() {
  const pdfBuffer = await renderToBuffer(<UserGuidePdf />)

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="esnad-user-guide.pdf"',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
