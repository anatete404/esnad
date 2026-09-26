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
      surveys: {
        orderBy: { createdAt: 'desc' },
        include: {
          surveyor: { select: { id: true, fullName: true } },
        },
      },
      appeal: {
        include: {
          reviewedBy: { select: { id: true, fullName: true } },
        },
      },
    },
  })

  if (!application) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }

  const canViewAppeals = can(session, 'appeals.view')

  return NextResponse.json({
    application: canViewAppeals ? application : { ...application, appeal: null },
    permissions: {
      canEditPayments: can(session, 'payments.edit'),
      canDeletePayments: can(session, 'payments.delete'),
      canEditAuthority: can(session, 'applications.edit'),
      canCreateContract: can(session, 'contracts.create'),
      canSignContract: can(session, 'contracts.sign'),
      canScheduleSurvey: can(session, 'surveys.schedule'),
      canSubmitSurvey: can(session, 'surveys.submit'),
      canAssign: can(session, 'applications.assign'),
      canTransfer: can(session, 'applications.transfer'),
      canVerifyDocs: can(session, 'documents.verify'),
      canViewAppeals,
    },
  })
}
