import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const schema = z.object({
  assignedToId: z.string().nullable(),
  notes: z.string().max(500).optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  if (!can(session, 'applications.assign')) {
    return NextResponse.json({ error: 'لا تملك صلاحية الإسناد' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true, assignedToId: true, branchId: true, trackingNumber: true },
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

    // لو بنسند لموظف، تأكد إنه موجود ونشط
    if (data.assignedToId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: data.assignedToId },
        select: { id: true, isActive: true, fullName: true },
      })

      if (!targetUser || !targetUser.isActive) {
        return NextResponse.json({ error: 'الموظف غير موجود أو غير نشط' }, { status: 400 })
      }
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { assignedToId: data.assignedToId },
      select: {
        id: true,
        assignedToId: true,
        assignedTo: { select: { id: true, fullName: true } },
        updatedAt: true,
      },
    })

    await prisma.stageHistory.create({
      data: {
        applicationId: id,
        fromStage: null,
        toStage: 'ASSIGN',
        action: 'ASSIGN',
        notes: data.notes || null,
        userId: session.id,
      },
    })

    await logAudit({
      userId: session.id,
      branchId: application.branchId,
      actorBranchId: session.branchId,
      action: 'APPLICATION_ASSIGN',
      entity: 'Application',
      entityId: id,
      oldValue: { assignedToId: application.assignedToId },
      newValue: { assignedToId: data.assignedToId },
    })

    if (
      data.assignedToId &&
      data.assignedToId !== application.assignedToId &&
      data.assignedToId !== session.id
    ) {
      await prisma.notification.create({
        data: {
          userId: data.assignedToId,
          applicationId: id,
          title: 'تم إسناد طلب إليك',
          body: `تم إسناد الطلب ${application.trackingNumber} إليك بواسطة ${session.fullName}`,
        },
      })
    }

    return NextResponse.json({ success: true, application: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('[assign]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
