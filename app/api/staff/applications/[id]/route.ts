import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can, scopeWhere } from '@/lib/rbac'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  if (!can(session, 'applications.view')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { id } = await params

  const application = await prisma.application.findFirst({
    where: {
      id,
      ...scopeWhere(session, 'BRANCH'),
    },
    include: {
      citizen: true,
      land: true,
      documents: {
        orderBy: { uploadedAt: 'desc' },
        include: {
          verifiedBy: { select: { id: true, fullName: true } },
        },
      },
      stages: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, fullName: true } } },
      },
      assignedTo: { select: { id: true, fullName: true, email: true } },
      reviewedBy: { select: { id: true, fullName: true } },
      contract: true,
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!application) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }

  return NextResponse.json({
    application,
    permissions: {
      canEditPayments: can(session, 'payments.edit'),
      canDeletePayments: can(session, 'payments.delete'),
      canEditAuthority: can(session, 'applications.edit'),
    },
  })
}
