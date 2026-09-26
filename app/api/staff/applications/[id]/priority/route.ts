import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { logAudit } from '@/lib/audit'

const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const

const schema = z.object({
  priority: z.enum(PRIORITIES),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }
  if (!can(session, 'applications.edit')) {
    return NextResponse.json({ error: 'لا تملك صلاحية' }, { status: 403 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const application = await prisma.application.findUnique({
      where: { id },
      select: { id: true, branchId: true, priority: true, updatedAt: true },
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

    if (application.priority === data.priority) {
      return NextResponse.json({
        success: true,
        application: {
          id: application.id,
          priority: application.priority,
          updatedAt: application.updatedAt,
        },
      })
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { priority: data.priority },
      select: { id: true, priority: true, updatedAt: true },
    })

    await logAudit({
      userId: session.id,
      branchId: application.branchId,
      actorBranchId: session.branchId,
      action: 'APPLICATION_PRIORITY_UPDATE',
      entity: 'Application',
      entityId: id,
      oldValue: { priority: application.priority },
      newValue: { priority: data.priority },
    })

    return NextResponse.json({ success: true, application: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      )
    }
    console.error('[priority]', err)
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}