import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const schema = z.object({
  newAssigneeId: z.string().nullable(),
  notes: z.string().min(5, 'الملاحظات قصيرة جداً — 5 أحرف على الأقل').max(500),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  if (!can(session, 'applications.assign')) {
    return NextResponse.json({ error: 'لا تملك صلاحية التسليم' }, { status: 403 })
  }

  const { id } = await params

  try {
    const data = schema.parse(await req.json())
    const application = await prisma.application.findUnique({
      where: { id },
      select: {
        id: true,
        trackingNumber: true,
        branchId: true,
        assignedToId: true,
        assignedTo: { select: { fullName: true } },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    if (
      session.roleKey !== 'admin' &&
      application.branchId &&
      application.branchId !== session.branchId
    ) {
      return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
    }

    if (data.newAssigneeId) {
      const target = await prisma.user.findUnique({
        where: { id: data.newAssigneeId },
        select: { id: true, isActive: true, fullName: true, branchId: true },
      })
      if (!target || !target.isActive) {
        return NextResponse.json({ error: 'الموظف غير موجود أو غير نشط' }, { status: 400 })
      }
      if (
        session.roleKey !== 'admin' &&
        application.branchId &&
        target.branchId !== application.branchId
      ) {
        return NextResponse.json({ error: 'لا يمكن التسليم لموظف من فرع آخر' }, { status: 403 })
      }
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { assignedToId: data.newAssigneeId },
      select: {
        id: true,
        assignedToId: true,
        assignedTo: { select: { id: true, fullName: true } },
      },
    })

    await prisma.stageHistory.create({
      data: {
        applicationId: id,
        fromStage: null,
        toStage: 'HANDOVER',
        action: 'HANDOVER',
        notes: data.notes,
        userId: session.id,
      },
    })

    if (data.newAssigneeId) {
      await prisma.notification.create({
        data: {
          userId: data.newAssigneeId,
          applicationId: id,
          title: `تم تسليم طلب إليك — ${application.trackingNumber}`,
          body: `من: ${session.fullName}\n${data.notes}`,
        },
      })
    }

    if (application.assignedToId && application.assignedToId !== session.id) {
      await prisma.notification.create({
        data: {
          userId: application.assignedToId,
          applicationId: id,
          title: `تم سحب طلب منك — ${application.trackingNumber}`,
          body: `بواسطة: ${session.fullName}`,
        },
      })
    }

    await logAudit({
      userId: session.id,
      action: 'APPLICATION_HANDOVER',
      entity: 'Application',
      entityId: id,
      oldValue: { assignedToId: application.assignedToId },
      newValue: { assignedToId: data.newAssigneeId, notes: data.notes },
    })

    return NextResponse.json({ success: true, application: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 },
      )
    }
    console.error('[handover]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
