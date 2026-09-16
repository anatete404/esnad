import { NextResponse } from 'next/server'
import { clearCitizenCookie } from '@/lib/auth'

export async function POST() {
  await clearCitizenCookie()
  return NextResponse.json({ success: true })
}
