import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can, scopeWhere } from '@/lib/rbac'

export async function GET(req: Request) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'appeals.view')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || ''
  const q = searchParams.get('q')?.trim() || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const pageSize = Math.min(50, Math.max(10, parseInt(searchParams.get('pageSize') || '20')))

  const branchScope = scopeWhere(session, 'BRANCH')

  const where: Record<string, unknown> = {}
  if (status) where.status = status

  if (Object.keys(branchScope).length > 0) {
    where.application = {
      branchId: (branchScope as { branchId: string }).branchId,
    }
  }

  if (q) {
    where.OR = [
      { reason: { contains: q } },
      { citizen: { fullName: { contains: q } } },
      { citizen: { nationalId: { contains: q } } },
      { application: { trackingNumber: { contains: q } } },
    ]
  }

  const [total, items] = await Promise.all([
    prisma.appeal.count({ where }),
    prisma.appeal.findMany({
      where,
      include: {
        citizen: { select: { id: true, fullName: true, nationalId: true, phone: true } },
        application: {
          select: {
            id: true,
            trackingNumber: true,
            status: true,
            stage: true,
            land: { select: { gov: true, totalFaddan: true } },
          },
        },
        reviewedBy: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
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
