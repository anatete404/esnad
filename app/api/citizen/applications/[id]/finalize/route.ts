import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCitizenSession } from '@/lib/auth'
import { logAudit } from '@/lib/audit'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCitizenSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params

  const application = await prisma.application.findFirst({
    where: { id, citizenId: session.id },
    include: {
      _count: { select: { documents: true } },
    },
  })

  if (!application) {
    return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
  }

  if (application.status === 'COMPLETED' || application.status === 'REJECTED') {
    return NextResponse.json(
      { error: 'لا يمكن تعديل طلب مغلق' },
      { status: 400 }
    )
  }

  if (application._count.documents === 0) {
    return NextResponse.json(
      { error: 'يجب رفع مستند واحد على الأقل قبل الإرسال' },
      { status: 400 }
    )
  }

  await prisma.notification.create({
    data: {
      citizenId: session.id,
      applicationId: id,
      title: 'تم استلام طلبك مع المستندات',
      body: `رقم التتبع: ${application.trackingNumber}`,
    },
  })

  await logAudit({
    branchId: application.branchId,
    actorBranchId: null,
    action: 'APPLICATION_FINALIZED',
    entity: 'Application',
    entityId: id,
    newValue: {
      trackingNumber: application.trackingNumber,
      documentsCount: application._count.documents,
    },
  })

  return NextResponse.json({
    success: true,
    trackingNumber: application.trackingNumber,
  })
}
