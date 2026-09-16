import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can, scopeWhere } from '@/lib/rbac'

export async function GET(req: Request) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  if (!can(session, 'applications.view')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || ''
  const stage = searchParams.get('stage') || ''
  const status = searchParams.get('status') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const pageSize = Math.min(50, Math.max(10, parseInt(searchParams.get('pageSize') || '20')))

  const where: Record<string, unknown> = {
    ...scopeWhere(session, 'BRANCH'),
  }

  if (stage) where.stage = stage
  if (status) where.status = status

  if (q) {
    where.OR = [
      { trackingNumber: { contains: q } },
      { citizen: { fullName: { contains: q } } },
      { citizen: { nationalId: { contains: q } } },
      { land: { gov: { contains: q } } },
    ]
  }

  const [total, items] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      include: {
        citizen: { select: { id: true, fullName: true, nationalId: true, phone: true } },
        land: { select: { gov: true, center: true, village: true, totalFaddan: true } },
        assignedTo: { select: { id: true, fullName: true } },
        _count: { select: { documents: true } },
      },
      orderBy: { submittedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}
