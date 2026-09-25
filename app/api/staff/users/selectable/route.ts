import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'

export async function GET() {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  if (!can(session, 'applications.view')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const isGlobal =
    session.roleKey === 'admin' || session.roleKey === 'authority_viewer'
  const whereClause = isGlobal
    ? {}
    : session.branchId
      ? { branchId: session.branchId }
      : { id: '__no_access__' }

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      terminatedAt: null,
      ...whereClause,
    },
    select: {
      id: true,
      fullName: true,
      role: { select: { key: true, nameAr: true } },
    },
    orderBy: { fullName: 'asc' },
  })

  return NextResponse.json(users)
}