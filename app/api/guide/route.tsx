import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.redirect(new URL('/guide', process.env.NEXT_PUBLIC_SITE_URL || 'https://hassan-platform.vercel.app'))
}
