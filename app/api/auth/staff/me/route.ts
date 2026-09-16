import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth'

export async function GET() {
  const session = await getUserSession()

  if (!session) {
    return NextResponse.json({ error: 'غير مسجّل' }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      id: session.id,
      fullName: session.fullName,
      email: session.email,
      roleKey: session.roleKey,
      branchId: session.branchId,
      permissions: session.permissions,
    },
  })
}
