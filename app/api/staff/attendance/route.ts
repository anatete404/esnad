import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'

export async function GET(req: Request) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const scope = searchParams.get('scope') || 'my'
  const userId = searchParams.get('userId') || null
  const parsedLimit = Number.parseInt(searchParams.get('limit') || '50', 10)
  const limit = Math.min(200, Math.max(10, Number.isNaN(parsedLimit) ? 50 : parsedLimit))

  if (
    scope === 'all' &&
    !can(session, 'users.manage') &&
    session.roleKey !== 'branch_manager'
  ) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const where: Record<string, unknown> = {}

  if (scope === 'my') {
    where.userId = session.id
  } else if (userId) {
    where.userId = userId
  } else if (session.roleKey !== 'admin' && session.roleKey !== 'branch_manager') {
    where.userId = session.id
  } else if (session.branchId && session.roleKey === 'branch_manager') {
    where.user = { branchId: session.branchId }
  }

  const [items, activeSession] = await Promise.all([
    prisma.attendance.findMany({
      where,
      orderBy: { checkInAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            role: { select: { nameAr: true } },
            branch: { select: { name: true } },
          },
        },
      },
    }),
    prisma.attendance.findFirst({
      where: { userId: session.id, checkOutAt: null },
      orderBy: { checkInAt: 'desc' },
    }),
  ])

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayRecords = await prisma.attendance.findMany({
    where: { userId: session.id, checkInAt: { gte: todayStart } },
  })
  const todayMinutes = todayRecords.reduce(
    (sum, record) => sum + (record.durationMinutes || 0),
    0,
  )

  return NextResponse.json({
    items,
    activeSession,
    todayMinutes,
    totalCount: items.length,
  })
}
