import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'

// GET: عرض تفاصيل التظلم
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'appeals.view')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { id } = await params

  const appeal = await prisma.appeal.findUnique({
    where: { id },
    include: {
      citizen: {
        select: {
          id: true,
          fullName: true,
          nationalId: true,
          phone: true,
          gov: true,
          center: true,
        },
      },
      application: {
        select: {
          id: true,
          trackingNumber: true,
          status: true,
          stage: true,
          branchId: true,
          submittedAt: true,
          land: {
            select: {
              gov: true,
              center: true,
              village: true,
              detail: true,
              totalFaddan: true,
              authorityName: true,
            },
          },
        },
      },
      reviewedBy: { select: { id: true, fullName: true } },
    },
  })

  if (!appeal) {
    return NextResponse.json({ error: 'التظلم غير موجود' }, { status: 404 })
  }

  if (
    session.roleKey !== 'admin' &&
    session.roleKey !== 'authority_viewer' &&
    appeal.application.branchId &&
    appeal.application.branchId !== session.branchId
  ) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  return NextResponse.json({ appeal })
}
