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

  if (q.length < 2) {
    return NextResponse.json({ applications: [], appeals: [], users: [] })
  }

  const branchScope = scopeWhere(session, 'BRANCH')
  const branchFilter =
    Object.keys(branchScope).length > 0
      ? { branchId: (branchScope as { branchId: string }).branchId }
      : {}

  try {
    const [applications, appeals, users] = await Promise.all([
      can(session, 'applications.view')
        ? prisma.application.findMany({
            where: {
              ...branchFilter,
              OR: [
                { trackingNumber: { contains: q } },
                { citizen: { fullName: { contains: q } } },
                { citizen: { nationalId: { contains: q } } },
                { citizen: { phone: { contains: q } } },
                { land: { gov: { contains: q } } },
                { land: { center: { contains: q } } },
              ],
            },
            select: {
              id: true,
              trackingNumber: true,
              status: true,
              stage: true,
              citizen: { select: { fullName: true, nationalId: true } },
            },
            orderBy: { submittedAt: 'desc' },
            take: 8,
          })
        : Promise.resolve([]),

      can(session, 'appeals.view')
        ? prisma.appeal.findMany({
            where: {
              ...(Object.keys(branchScope).length > 0
                ? { application: { branchId: (branchScope as { branchId: string }).branchId } }
                : {}),
              OR: [
                { reason: { contains: q } },
                { citizen: { fullName: { contains: q } } },
                { citizen: { nationalId: { contains: q } } },
                { application: { trackingNumber: { contains: q } } },
              ],
            },
            select: {
              id: true,
              status: true,
              reason: true,
              application: { select: { trackingNumber: true } },
              citizen: { select: { fullName: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          })
        : Promise.resolve([]),

      can(session, 'users.manage')
        ? prisma.user.findMany({
            where: {
              isActive: true,
              OR: [
                { fullName: { contains: q } },
                { email: { contains: q } },
                { phone: { contains: q } },
              ],
            },
            select: {
              id: true,
              fullName: true,
              email: true,
              role: { select: { nameAr: true } },
            },
            orderBy: { fullName: 'asc' },
            take: 5,
          })
        : Promise.resolve([]),
    ])

    return NextResponse.json({ applications, appeals, users })
  } catch (err) {
    console.error('[search]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
